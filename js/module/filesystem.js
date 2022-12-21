// const { drawCheckBox } = require("pdf-lib");

Core.registerModule("filesystem", function (sb) {

	var webui, webfs,
		global;//global variable

	return {
		init: function () {
			//initial global var
			var _this = this;
			global = this;
			//global._curSaveId = 1;
			//global._lastSaveId = -1;
			//global._curTempId = 0;

			let url = new URL(window.location.href);
            const id = url.searchParams.get('content_id');
            const template_no = url.searchParams.get('template_no');
			global._saveHtmlFileId = 0;
			global._isTemplateFile = false;

			if(id !== null)
			{
				console.log('abdul this is not a template now ');
				global._saveHtmlFileId = id;
			}
			else if(id == null && template_no !== null)
			{
				global._isTemplateFile = true;
				global._saveHtmlFileId = template_no;
				console.log('abdul this is template now ');
			}


			//The id of the currently open editing slide
			// var _lastSaveId = window.localStorage.getItem('slider_file_saveId');

			// if (_lastSaveId !== null && _lastSaveId !== undefined) {
			// 	//console.log('last id : ' + _lastSaveId);
			// 	global._lastSaveId = parseInt(_lastSaveId);
			// 	global._curSaveId = (global._lastSaveId + 1) % 2;
			// 	//console.log('_curSaveId' + global._curSaveId);
			// }
			// window.localStorage.setItem('slider_file_saveId', global._curSaveId);

			_.bindAll(this);
			sb.listen({
				'preSave': this.checkAutoSave,
				'beforeCloseSave': this.beforeCloseSave,
				'showFileSystem': this.showFileSystem,
				'sentHtmlFileToServer': this.sentHtmlFileToServer,
				'saveFile': this.saveFileHandler,
				'openFileSystem': this.openFileSystem
			});
			$('#returnHomeBtn').on('click', function () {
				$('#filesystem').hide();
				// $('body').css('overflow', 'hidden');
				$("#appContainer").removeClass('dp-none');
				sb.notify({
					type: 'enterEditorMode',
					data: null
				});
			})
			function msg(msg) {
				var $nBox = $('#notifyBox');
				$nBox.find('#notifyMsg').html(msg);
				$nBox.showPopbox();
			}
			function errHandler(err) {
				var errStr = err.code && (webfs.errorCodeMap[err.code] || webfs.phonegapErrorCodeMap[err.code])
				msg(errStr || err);
			}
			function hideMsg() {
				var $nBox = $('#notifyBox');
				$nBox.suiHide();
			}
			//Save to the current module global
			global._errHandler = errHandler;
			global._hideMsg = hideMsg;
			require(['webfs'],
				function (wfs) {
					webui = wfs.webui;
					webfs = wfs.webfs;
					global.wfs = wfs;

					_this._container = '#fileView';

					webui.renderRoot(window.TEMPORARY, _this._container, function () {
						//file open event api
						webui.initFileOperation('click', _this._container, errHandler);
						//delete button api
						webui.initIconDel('click', _this._container, errHandler);
						//APP Event
						initWebuiEvenet();

						// $('#addFile').html('Save as');
						$(".fs-icon-back.fs-icon-root").css('top', '45px');
						$(".fs-view").css('marginTop', '105px')
						//Check the last cached file and reply
						// global._checkTemplFile.call(_this);
						//start auto save
						sb.notify({
							type: 'autoSaveTimer',
							data: null
						});

						sb.notify({
							type: 'renderHtmlFromWeb',
							data: null
						});


					}, global._errHandler, {
						filter: /^\.\~.*/
					});

					function initWebuiEvenet() {
						//Show popup
						$(document.body).on('click', "#addFolder", function (e) {
							var $target = $(e.target)
							$('#folderInpBox').showPopbox();
						}, errHandler);

						$(document.body).on('click', "#addFile", function (e) {
							var $target = $(e.target)
							$('#fileInpBox').showPopbox();
						}, errHandler);
						//Confirm input directory name
						$(document.body).on('click', '#folderInpBtn', function () {

							var folderName = $('#folderInp').val();

							webui.mkdir(folderName, _this._container, function () {
								$('#folderInpBox').suiHide();
							}, errHandler);
						})
						//Determine the content of the input file
						$(document.body).on('click', '#fileInpBtn', function () {

							var fileName = $('#fileNameInp').val(),
								// suffix = $('#fileSufInp').val(),
								suffix = 'html',
								content = _this.fileContent || $('#fileContentInp').val();

							// webui.writeFile(fileName + '.' + suffix, content, _this._container, function (file) {
							// 	var path = file.toURL(),
							// 		pathFrags = path.split('/'),
							// 		filename = pathFrags.pop(),
							// 		directory = pathFrags.join('/');

							// 	global._last_save_file = {
							// 		'filename': filename,
							// 		'directory': directory
							// 	}
							// 	$('#fileInpBox').suiHide();
							// }, errHandler);
						})
						//Show delete button
						$(document.body).on('click', '#showDeleteIcon', function () {
							webui.showDelStatus(_this._container);
						});
						//Add a hack to the navigation header
						$(window).on('scroll', function (e) {
							if (window.scrollY >= 45) $(".fs-icon-back.fs-icon-root").css('top', '0px');
							else $(".fs-icon-back.fs-icon-root").css('top', '45px');
						})
						$(_this._container).on('click', '.fs-icon-opt-upload', function (e) {
							var cwd = webui.getCwd(_this._container);
							webfs.openfile($(e.target).data('file'), cwd, function (file) {
								webfs.readfile(file, 'UTF-8', function (evt) {
									var content = evt.target.result;
									// $.ajax({
									//   type: 'POST',
									//   url: 'http://www.ktitalk.com/api/upload_file/index.html',
									//   data: JSON.stringify({
									//   	fileName : $(e.target).data('file'),
									//   	content : content,
									//   	type : 'text/html'
									//   }),
									//   contentType: 'application/json'
									// })



									// $.ajax({ 
									// 	data: {id:50,content:content},
									// 	type:'POST',
									// 	url:'https://www.ktitalk.com/api/upload_file',
									// 	success: function(response) { 
									// 		 alert("Your file has been uploaded");
									// 		}
									//  });





									// fetch("https://www.ktitalk.com/api/upload_file", {
									// 	method: 'POST',
									// 	crossDomain: true,
									// 	body: JSON.stringify({
									// 		// fileName : $(e.target).data('file'),
									//     	content: content,
									// 		id: 55,
									//     	// type : 'text/html',
									// 		// success: "File Uploaded!"

									// 	}),
									// 	headers: {
									// 		"Content-Type": "multipart/form-data",
									// 		"Accept": "*/*",
									// 		"Host": "www.ktitalk.com",

									// 	}
									// })

										// .then((response) => {
											// return response.json()
										// })
									// .then((data) => {
										// console.log(data)
									// })
										// console.log("Uploading Content: " + content);
							// }, function () {
								// alert('error');
							});
						}, errHandler);
					})

		}
	})

		},
_checkTemplFile: function (callback) {
	var _this = this,
		wrapCallback = function () {
			setTimeout(function () {
				global._hideMsg();
			}, 1500)
			callback && callback.call(_this);
		}
	if (global._lastSaveId !== -1) {
		//Get the last successfully saved cache file
		var lastTempFileName = window.localStorage.getItem('last_temp_file_name')
		var cwd = webui.getCwd(_this._container);
		global._errHandler(sb.lang().fileSystem_notice_restore);
		webfs.openfile(lastTempFileName, cwd, function (file) {
			webfs.readfile(file, 'UTF-8', function (evt) {
				var content = evt.target.result;
				sb.notify({
					type: 'loadTemplFile',
					data: content
				})
				wrapCallback();

			}, function (err) {
				global._errHandler(err);
				wrapCallback()
			});
		}, function (err) {
			wrapCallback();
			global._errHandler(err)
		});
	}
},
_saveFile: function (data) {

},
saveFileHandler: function (data) {
	if (!global._save_file) global.showFileSystem(data);
	else global._saveFile(data);
},
//保存临时文件
beforeCloseSave: function (data) {
	// var directory = './',
	// 	filename = '.~close_temp_file_' + global._curSaveId + '-' + global._curTempId;
	// // window.localStorage.setItem('is_save_temp_file_success', 'false')
	// global.wfs.webfs.writeFileInPath(directory,
	// 	filename, data, function () {
	// 		//The current editing cache file is saved as two (saved state and to-be-saved state)
	// 		global._curTempId = (global._curTempId + 1) % 2;
	// 		//Re-mark the cache file that is currently saved successfully
	// 		window.localStorage.setItem('last_temp_file_name', filename)
	// 		// global._errHandler('Temporary file successfully saved')
	// 	}, function (err) {
	// 		// global._errHandler('Failed to save temp file:' + err.code)
	// 		console.log('Failed to Save File:' + err.code)
	// 		//global._lastSaveId = -1;
	// 		//global._curSaveId = 1;
	// 		//window.localStorage.setItem('slider_file_saveId', global._curSaveId);
	// 	}, { override: true });
},
//Check if autosave
checkAutoSave: function (data) {
	sb.notify({
		type: "sentHtmlFileToServer",
		data: data
	});
	// if (global._last_save_file) {
	// 	global.wfs.webfs.writeFileInPath(global._last_save_file.directory,
	// 		global._last_save_file.filename, data, function () {
	// 			alert('File Saved Successfully');
	// 		}, function (err) {
	// 			alert('error' + err.code);
	// 		}, { override: true });
	// } else {


	// 	// sb.notify({
	// 	// 	type: "showFileSystem",
	// 	// 	data: data
	// 	// });
	// 	// sb.notify({
	// 	// 	type: 'enterPreviewMode',
	// 	// 	data: null
	// 	// })
	// }
},
sentHtmlFileToServer: function (data) {
	var param_data = (global._isTemplateFile)? {template_no:global._saveHtmlFileId,content:data} : {id:global._saveHtmlFileId,content:data};
	var param_url = (global._isTemplateFile)? 'https://www.ktitalk.com/api/update_category_template' : 'https://www.ktitalk.com/api/upload_file';
	$.ajax({ 	
		data: param_data,
		type:'POST',
		url: param_url,
		beforeSend: function(){
			$(iziToast.info({
				// timeout:3000,
				title: 'Saving',
			}));
		  },

		success: function(response) { 
			Swal.fire(
				'Done!',
				'File Saved Successfully!',
				'success'
			  )
			//   console.log('abdul file saved = '+response);
			// alert("File saved successfully");
			},

		error: function(XMLHttpRequest, textStatus, errorThrown) {
			Swal.fire({
				icon: 'error',
				title: 'Failed!',
				text: 'Filed to Save File!',
			  })
			// alert("Failed with some errors");
			}
	 });
},
showFileSystem: function (data) {
	window.location.hash = '!filesystem'
	this.fileContent = data;
	$("#filesystem").suiShow();
	$('body').css('overflow', 'auto')
	$('#filesystem').show();
	$('#addFile').css('visibility', 'visible');
	$("#appContainer").addClass('dp-none');
},
openFileSystem: function () {
	window.location.hash = '!filesystem'
	this.fileContent = null;
	sb.notify({
		type: 'showFileSystem',
		data: null
	})
	sb.notify({
		type: 'enterPreviewMode',
		data: null
	})
	$('#addFile').css('visibility', 'hidden');

}
	}
});