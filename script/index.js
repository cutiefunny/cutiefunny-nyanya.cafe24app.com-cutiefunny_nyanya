var ib_search = document.getElementById('ib_search');
var ib_search_backup = document.getElementById('ib_search_backup');
var btn_search = document.getElementById('btn_search');
var lbx_whiteList = document.getElementById('lbx_whiteList');
var sbx_collections = document.getElementById('sbx_collections');
var sbx_userID = document.getElementById('sbx_userID');

window.onload = function(){
    callAjax("I");
};

//리스트 클릭
function selectWhiteList(){ ib_search.value = $("#lbx_whiteList option:selected").text(); }

//리스트 더블클릭
function showUserInsta(){ window.open("http://instagram.com/"+$("#lbx_whiteList option:selected").text()); }

//셀렉트박스에서 콜렉션 선택
function selectCollection(){ alert($("#sbx_collections option:selected").text()) }

//CRUD
function search(){ callAjax("R") }
function insert(){ callAjax("C") }
function del(){ callAjax("D") }

//Ajax 함수
function callAjax(op) {

    $.ajax({
        url: '/ajax',
        dataType: 'json',
        type: 'POST',
        data: { msg : ib_search.value
            , op : op
            , col : $("#sbx_collections option:selected").text()
            , userID : $("#sbx_userID option:selected").text() 
        },
        success: function(result) {

            if ( result['result'] == "R" ) {
                lbx_whiteList.options.length = 0;
                ib_search_backup.value = ib_search.value;
                lbx_whiteList.setAttribute("size",result['msg'].length);
                result['msg'].forEach(element => {
                    lbx_whiteList.options[lbx_whiteList.options.length] = new Option(element,"");
                });
            }else if( result['result'] == "C" ){
                lbx_whiteList.setAttribute("size",lbx_whiteList.options.length+1);
                lbx_whiteList.options[lbx_whiteList.options.length] = new Option(ib_search.value,"");
            }else if( result['result'] == "D" ){
                ib_search.value = ib_search_backup.value;
                callAjax("R");
            }else if( result['result'] == "I" ){
                result['msg'].forEach(element => {
                    sbx_userID.options[sbx_userID.options.length] = new Option(element,"");
                });
            }
            
        } //function끝
    }).done(function(response) {
        //alert("success");
    }).fail(function(response, txt, e) {
        alert("fail");
    }); // ------      ajax 끝-----------------
}

