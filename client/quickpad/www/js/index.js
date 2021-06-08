const serverURL = 'http://172.20.10.2:3000';
const getData = `${serverURL}/getData`;
const saveData = `${serverURL}/saveDoc`;
const uploadData = `${serverURL}/saveDocs`;
const deleteData = `${serverURL}/deleteAllDocs`;
let dataArray = [];

document.addEventListener('deviceready', onDeviceReady, false);

class Note {
  constructor(title, note) {
    this.title = title;
    this.content = note;
    this.author = 'utsav';
    this.createdDt = new Date();
    this.modifiedDt = new Date();
    this.sharableLink = '';
    this.isDeleted = false;
  }
}
let getDataFromCloud = async () => {
  let promise = new Promise((res, rej) => {
    try {
      $.get(getData, function (data, status) {
        console.log('inside await fn');
        res(data);
      });
    } catch (error) {
      rej(error);
    }
  });

  let result = await promise;
  console.log('after await fn');
  return result;
};

let saveDataToCloud = async (notes) => {
  let promise = new Promise((res, rej) => {
    try {
      var str = JSON.stringify(notes);
      $.post(
        saveData,
        { foo: str },
        function (data, status) {
          if (status === 'success') {
            res(data);
          }
        },
        'json'
      );
    } catch (error) {
      rej(error);
    }
  });

  let result = await promise;
  return result;
};

let fetchNotes = async () => {
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
      htmlSegment += '<td>' + element['_id'] + '</td></tr>';
      htmlSegment += '<tr><td class="col-header">Title</td>';
      htmlSegment += '<td>' + element['title'] + '</td></tr>';

      htmlSegment += '</tbody></table>';
      htmlSegment += '</li>';
      html += htmlSegment;
    });
    $('#notes-container ul').append(html);
    $('#notes-container ul').listview('refresh');
  };
  await getDataFromCloud().then(function (response) {
    data = response;
    outputDataTable(data);
  });
};

let saveNote = async (notes) => {
  await saveDataToCloud(notes).then(function (response) {
    debugger;
    console.log(response);
    clearForm();
    alert('Data Stored!');
  });
};

let clearForm = function () {
  $('#editNote').val('');
  $('form#note-form').validate().resetForm();
};

$(document).on('pagecreate', '#mainPage', function (event) {
  let page = $(this);
  fetchNotes();

  $(page).on('click', '#addLocalData', function (evt) {
    $('body').pagecontainer('change', '#pg-display-new', {
      transition: 'flip',
    });
  });

  $(document).on('click', '#btnSave', function (evt) {
    evt.preventDefault();
    let form = $('form#note-form');
    if (form.valid()) {
      let note = $('#editNote').val();
      let title = note.substring(0, 30);

      let myNote = new Note(title, note);
      saveNote(myNote);
    } else {
      $('#errorMsg').popup('open');
    }
  });
}); // END jQueryMobile init

//For cordova onDeviceReady
function onDeviceReady() {
  console.log('device is ready!');
  const getStartPosition = (e) => {
    debugger;
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
      debugger;
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
