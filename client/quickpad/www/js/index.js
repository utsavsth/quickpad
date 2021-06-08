const serverURL = 'http://192.168.1.106:3000';
const getData = `${serverURL}/getData`;
const saveData = `${serverURL}/saveDoc`;
const uploadData = `${serverURL}/saveDocs`;
const deleteData = `${serverURL}/deleteAllDocs`;
let dataArray = [];
let noteId;

document.addEventListener('deviceready', onDeviceReady, false);

class Note {
  constructor(title, note, username) {
    this.title = title;
    this.content = note;
    this.author = username;
    this.createdDt = new Date();
    this.modifiedDt = new Date();
    this.sharableLink = '';
    this.isDeleted = false;
  }
}

let getAllDataFromCloud = async (username, searchText) => {
  let promise = new Promise((resolve, reject) => {
    try {
      let isLoggedin = localStorage.getItem('username');
      if (isLoggedin === undefined || isLoggedin === null) {
        reject({ status: 403, msg: 'not logged in!' });
        return;
      }

      let queryUrl = `${getData}`;
      queryUrl = queryUrl.concat('?search=' + (searchText || ''));
      console.log(queryUrl);
      $.ajax({
        url: queryUrl,
        type: 'GET',
        headers: {
          'X-Requested-Username': username,
        },
        success: function (data, status) {
          resolve(data);
        },
        error: function (error) {
          reject(error);
        },
      });
    } catch (err) {
      reject(err);
    }
  });

  let result = await promise;
  console.log('after await fn');
  return result;
};

let getDatabyIdFromCloud = async (username, id) => {
  let promise = new Promise((resolve, reject) => {
    try {
      let isLoggedin = localStorage.getItem('username');
      if (isLoggedin === undefined || isLoggedin === null) {
        reject({ status: 403, msg: 'not logged in!' });
        return;
      }

      let queryUrl = `${getData}`;
      queryUrl = queryUrl.concat('/' + id);
      console.log(queryUrl);
      $.ajax({
        url: queryUrl,
        type: 'GET',
        headers: {
          'X-Requested-Username': username,
        },
        success: function (data, status) {
          resolve(data);
        },
        error: function (error) {
          reject(error);
        },
      });
    } catch (err) {
      console.log(err);
      reject(err);
    }
  });

  let result = await promise;
  return result;
};

let saveDataInCloud = async (notes) => {
  let promise = new Promise((resolve, reject) => {
    try {
      var str = JSON.stringify(notes);
      $.post(
        saveData,
        { foo: str },
        function (data, status) {
          if (status === 'success') {
            resolve(data);
          }
        },
        'json'
      );
    } catch (error) {
      reject(error);
    }
  });

  let result = await promise;
  return result;
};

let updateDataInCloud = async (id, title, content) => {
  let promise = new Promise((resolve, reject) => {
    try {
      let username = localStorage.getItem('username');
      var str = JSON.stringify({ title, content });
      var putUrl = saveData + `/${id}`;
      $.ajax({
        url: putUrl,
        type: 'PUT',
        headers: {
          'X-Requested-Username': username,
        },
        data: { foo: str },
        success: function (data, status) {
          resolve(data);
        },
        error: function (error) {
          reject(error);
        },
      });
    } catch (error) {
      reject(error);
    }
  });

  let result = await promise;
  return result;
};

let fetchNotes = async (username, searchText) => {
  if (username === undefined || username === null) {
    username = localStorage.getItem('username');
    if (username === undefined || username === null) {
      console.log('not logged in');
      return;
    }
  }
  let outputDataTable = function (data) {
    let html = '';
    let htmlSegment = '';

    if (data == undefined || data.length == 0) {
      return;
    }
    data.forEach((element) => {
      htmlSegment = '<li id="' + element['_id'] + '">';
      htmlSegment += '<table class="ui-responsive table-stroke"><tbody>';

      htmlSegment += '<tr class="col-id"><td class="col-header">Id</td>';
      htmlSegment += '<td colspan="3">' + element['_id'] + '</td></tr>';
      htmlSegment += '<tr><td class="col-header">Title</td>';
      htmlSegment += '<td>' + element['title'] + '</td>';
      htmlSegment +=
        '<td><a href="#" id="e_' +
        element['_id'] +
        '" class="edit-note ui-btn ui-icon-edit ui-btn-icon-left ui-btn-icon-notext ui-shadow ui-corner-all">edit</a></td>';
      htmlSegment +=
        '<td><a href="#" id="d_' +
        element['_id'] +
        '" class="del-note ui-btn ui-icon-delete ui-btn-icon-left ui-btn-icon-notext ui-shadow ui-corner-all">delete</a></td></tr>';
      htmlSegment += '</tbody></table>';

      htmlSegment += '</li>';
      html += htmlSegment;
    });
    $('#notes-container ul').append(html);
    $('#notes-container ul').listview('refresh');
  };
  await getAllDataFromCloud(username, searchText).then(
    function (response) {
      data = response;
      $('#notes-container ul').html('');
      outputDataTable(data);
    },
    function (err) {
      debugger;
    }
  );
};

let saveNote = async (notes) => {
  await saveDataInCloud(notes).then(function (response) {
    console.log(response);
    clearForm();
    alert('Data Stored!');
    fetchNotes();
  });
};

let updateNote = async (id, title, note) => {
  await updateDataInCloud(id, title, note).then(function (response) {
    console.log(response);
    alert('Data Updated!');
    fetchNotes();
  });
};

let clearForm = function () {
  $('#editNote').val('');
  $('form#note-form').validate().resetForm();
};

$(document).on('pagehide', '#pg-display-new', function (evt) {
  noteId = '';
  $('#editNote').val('');
});

$(document).on('pagecreate', '#mainPage', function (event) {
  let page = $(this);
  let username = localStorage.getItem('username');
  let typingInterval = 3000; //3000ms = 3sec
  let typingTimer;

  if (username === undefined || username === null) {
    console.log('not logged in');
    window.location.href = 'index.html';
  }
  fetchNotes(username, '');

  $(page).on('click', '#addLocalData', function (evt) {
    $('body').pagecontainer('change', '#pg-display-new', {
      transition: 'flip',
    });
  });

  $(document).on('keyup', '#searchNotes', function (e) {
    console.log(e.target.value);
    e.preventDefault();
    //searching after user is done typing
    clearTimeout(typingTimer);
    if (e.target.value) {
      typingTimer = setTimeout(function () {
        //async call to get searching notes
        fetchNotes(username, e.target.value);
      }, typingInterval);
    }
  });

  $(document).on('click', '.edit-note', function (e) {
    console.log(e.target.id);
    e.preventDefault();
    getDatabyIdFromCloud(
      username,
      e.target.id.substring(2, e.target.id.length)
    ).then(function (response) {
      var note = response[0];
      noteId = note['_id'];
      $('#editNote').val(note['content']);
      $('body').pagecontainer('change', '#pg-display-new', {
        transition: 'flip',
      });
    });
  });

  $(document).on('click', '.del-note', function (e) {
    debugger;
    console.log(e.target.id);
  });

  $(document).on('click', '#btnSave', function (evt) {
    evt.preventDefault();
    let form = $('form#note-form');
    if (form.valid()) {
      let note = $('#editNote').val();
      let title = note.substring(0, 30);

      if (noteId !== null && noteId !== '' && noteId.length > 0) {
        updateNote(noteId, title, note);
      } else {
        let myNote = new Note(title, note, username);
        saveNote(myNote);
      }
    } else {
      $('#errorMsg').popup('open');
    }
  });
}); // END jQueryMobile init

//For cordova onDeviceReady
function onDeviceReady() {
  console.log('device is ready!');
  const getStartPosition = (e) => {
    const delta_x = e.deltaX;
    const delta_y = e.deltaY;
    const final_x = e.srcEvent.pageX || e.srcEvent.screenX || 0;
    const final_y = e.srcEvent.pageY || e.srcEvent.screenY || 0;

    return {
      x: final_x - delta_x,
      y: final_y - delta_y,
    };
  };

  $('#notes-container ul li').each(function () {
    var mc = new Hammer(this);
    mc.on('swipeleft', function (e) {
      var id = e.target.id;
      const { x } = getStartPosition(e);
      if (x >= 0 && x <= 50) {
        //swipe left handle
        alert('Congrats! swiped left');
      }
      alert(id);
    });
  });
}
