var parameters = arguments[0] || {};
var currentPhoto = parameters.photo || {};
var parentController = parameters.parentController || {};
var comments = Alloy.Collections.instance("Comment");

function loadComments(_photo_id) {
	var params = {
		photo_id : currentPhoto.id,
		order : '-created_at',
		per_page : 100
	};
	
	var rows = [];
	
	comments.fetch({
		data : params,
		success : function(model, response) {
			comments.each(function(comment) {
				var commentRow = Alloy.createController("commentRow", comment);
				rows.push(commentRow.getView());
			});
			// set the table rows
			$.commentTable.data = rows;
		},
		error : function(error) {
			alert('Error loanding comments ' + e.message);
			Ti.API.error(JSON.stringify(error));
		}
	});
}

$.initialize = function() {
    loadComments();
};

function doOpen() {
	if (OS_ANDROID) {
		var activity = $.getView().activity;
		var actionBar = activity.actionBar;
		
		activity.onCreateOptionsMenu = function(_event) {
			
			if (actionBar) {
				actionBar.displayHomeAsUp = true;
				actionBar.onHomeIconItemSelected = function() {
					$.getView().close();
				};
			} else {
				alert("No Action Bar Found");
			}
			
			// add the button/menu to the titlebar
			var menuItem = _event.menu.add({
				title : "New Comment",
				showAsAction : Ti.Android.SHOW_AS_ACTION_ALWAYS,
				icon : Ti.Android.R.drawable.ic_menu_edit
			});
			
			// event listener
			menuItem.addEventListener("click", function(e) {
				handleNewCommentButtonClicked();
			});
		};
	}
};

OS_IOS && $.newCommentButton.addEventListener("click", 
handleNewCommentButtonClicked);

function handleNewCommentButtonClicked(_event) {
	var navWin;
	var inputController = Alloy.createController("commentInput", {
		photo : currentPhoto,
		parentController : $,
		callback : function (_event) {
			inputController.getView().close();
			inputCallback(_event);			
		}
	});
	
	// open the window
	inputController.getView().open();
}

function inputCallback(_event) {
	if (_event.success) {
		addComment(_event.content);
	} else {
		alert("No Comment Added");
	}
}

function addComment(_content) {
	'use strict';
	var comment = Alloy.createModel('Comment');
	var params = {
		photo_id : currentPhoto.id,
		content : _content,
		allow_duplicate : 1
	};
	
	comment.save(params, {
		success : function(_model, respoonse) {
			Ti.API.info('success: ' + _model.toJSON());
			var row = Alloy.createController("commentRow", _model);
			
			// add the controller view, which is a row to the table
			if ($.commentTable.getData().length === 0) {
				$.commentTable.setData([]);
				$.commentTable.appendRow(row.getView(), true);
			} else {
				$.commentTable.insertRowBefore(0,row.getView(),true);
			}
		},
		error : function(e) {
			Ti.API.error('error: ' + e.message);
			alert('Error saving new comment ' + e.message);
		}
	});
}
