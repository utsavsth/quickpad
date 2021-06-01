const serverURL = 'http://localhost:3000';
const getData = `${serverURL}/getData`;
const saveData = `${serverURL}/saveDocs`;
const deleteData = `${serverURL}/deleteAllDocs`;
let dataArray = [];

document.addEventListener('deviceready', onDeviceReady, false);

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

let fetchData = async () => {
  let outputDataTable = function (data) {
    let html = '';
    let htmlSegment = '';

    if (data == undefined || data.length == 0) {
      return;
    }
    data.forEach((element) => {
      htmlSegment = '<li>';
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

$(document).on('pagecreate', '#mainPage', function (event) {
  let page = $(this);
  fetchData();
}); // END jQueryMobile init

//For cordova onDeviceReady
function onDeviceReady() {}
