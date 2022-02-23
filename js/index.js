let API = "http://localhost:8000/users"
//ПЕРЕМЕННЫЕ ДЛЯ ADD
let name = $(".name")
let lastname = $(".lastname")
let phoneNumber = $(".phone-number")
let weeklyKpi = $(".weekly-kpi")
let monthlyKpi = $(".monthly-kpi")
let btnAdd = $("#btn-add")
let input = $(".input")
let userList = $(".user-list")


let currentPage = 1 //ТЕКУЩАЯ СТРАНИЦА
let pageTotalCount = 1 //ОБЩЕЕ КОЛИЧЕСТВО СТРАНИЦ

let prev = $(".prev") //кнопка пред страница
let next = $(".next") //кнопка след страница
let paginationList = $(".pagination-list") // БЛОКА КУДА ДОБАВЛЯЮТСЯ КНОПКИ С ЦИФРАМИ ДЛЯ ПЕРЕКЛЮЧЕНИЯ МЕЖДУ СТРАНИЦАМИ



//переменные для инпутов: для редактирования товаров
let editTitle = $("#edit-title");
let editPrice = $("#edit-price");
let editDescr = $("#edit-descr");
let editWeekly = $("#weekly-kpi")
let editMonthly = $("#edit-monthly-kpi")
let editSaveBtn = $("#btn-save-edit");
let editFormModal = $("#editFormModal");

// ПОИСК
let searchInp = $("#search")
let searchVal = ""


//ADD
render()
btnAdd.on("click",()=>{
    if (!name.val().trim() || !lastname.val().trim() || !phoneNumber.val().trim()){
        return alert("Заполните поле")
    }
    let obj = {
        name:name.val(),
        lastname:lastname.val(),
        phoneNumber:phoneNumber.val(),
        weeklyKpi:weeklyKpi.val(),
        monthlyKpi:monthlyKpi.val()
    }
    setUsersToJson(obj)
    input.val("")
})
//отправка данных на сервер
function setUsersToJson(obj){

    fetch(API,{
        method:"POST",
        headers:{
            "Content-Type":"application/json; charset=utf-8"
        },
        body:JSON.stringify(obj)
    }).then(()=>{
        render() // моментально добавляется
    })
}

function render() {
    fetch(`${API}?q=${searchVal}&_limit=6&_page=${currentPage}`).then((response => {
        response.json().then((data=> {
            userList.html("")// не перезаписвал контакт
            data.forEach((value)=>{
                let element = drawContactList(value)
                userList.append(element)
            })
            drawPaginationButton()
        }))
    }))
}

//верстка контакт листа
function drawContactList(value){
    return `
    <tr class="text-left">
      <td style="color: white">${value.name}</td>
      <td style="color: white">${value.lastname}</td>
      <td style="color: white">${value.phoneNumber}</td>
      <td style="color: white">${value.weeklyKpi}</td>
      <td style="color: white">${value.monthlyKpi}</td>
      <td><button type="button" id=${value.id} class="btn btn-danger delete-btn ">DELETE</button></td>
      <td><a href="#" id=${value.id} class="btn btn-primary btn-edit" data-bs-toggle="modal" data-bs-target="#editFormModal">Edit</a> </td>
    </tr>
   `
}


// DELETE
$("body").on("click",".delete-btn", event =>deleteContact(event.target.id))
function deleteContact(id){
    fetch(`${API}/${id}`,{
        method:"DELETE",
    }).then(()=>{
        render()
    })
}

// EDIT

$("body").on("click", ".btn-edit", function () {
    fetch(`${API}/${this.id}`).then((response) =>
        response.json().then((data) => {
            //заполняем поля редактирования данными из элемента
            editTitle.val(data.name);
            editPrice.val(data.lastname);
            editDescr.val(data.phoneNumber);
            editWeekly.val(data.weeklyKpi)
            editMonthly.val(data.monthlyKpi)

            editSaveBtn.attr("id", data.id); //добавляем аттрибут id и записываем id редактируемого объекта
        })
    );
});

editSaveBtn.on("click", function () {
    let id = this.id; //вытаскиваем из кнопки Id и кладем его в переменную
    // сохранаяем значение input на модалки в переменные

    let name = editTitle.val();
    let lastname = editPrice.val();
    let phoneNumber = editDescr.val();
    let weekly = editWeekly.val()
    let monthly = editMonthly.val()


    let editedProduct = {
        // формируем новый объект, из новых данных, чтобы отправить на сервер
        name: name,
        lastname: lastname,
        phoneNumber: phoneNumber,
        weeklyKpi:weekly,
        monthlyKpi:monthly

    };
    console.log(editedProduct)

    saveEdit(editedProduct, id); //* мы вызываем функция для сохранение данных и передаем ей этот новый объект и id
});

function saveEdit(editedProduct, id) {
    fetch(`${API}/${id}`, {
        method: "PATCH", //ИЗМЕНЯЕТ
        headers: { "Content-Type": "application/json;charset=utf-8" },
        body: JSON.stringify(editedProduct),
    }).then(() => {
        render();
        $("#editFormModal").modal("hide"); //* изчезает модал
    });
}
searchInp.on("input",()=>{
    searchVal = searchInp.val() //записывает значение поисковика в переменную searchVal
    render()
})

//PAGINATION!!!!!!!!!!!!!

function drawPaginationButton(){
    fetch(`${API}?q=${searchVal}`) // ЗАПРОС НА СЕРВЕР ЧТОБЫ УЗНАТЬ ОБЩЕЕ КОЛИЧЕСТВО ПРОДУКТОВ
        .then((res)=>res.json())
        .then((data)=>{
            pageTotalCount = Math.ceil(data.length / 6) // общее количество продуктов делим на количество продуктов которые отображаются на странице
            paginationList.html("")
            for (let i = 1; i <= pageTotalCount; i++){
                // создаем кнопки с цифрами
                if (currentPage == i){
                    //СРАВНИВАЕМ ТЕКУЩУЮ  СТРАНИЦУ С ЦИФРОЙ ИЗ КНОПКИ ЕСЛИ СОВПАДАЕТ ТО НУЖНО
                    //ЗАКРАСИТЬ ЭТУ КНОПКУ ОБОЗНАЧАЯ НА КАКОЙ СТРАНИЦЕ МЫ НАХОДИМСЯ
                    paginationList.append(`
                       <li class="page-item active"><a class="page-link" href="#">${i}</a></li>
                    `)
                }else {
                    paginationList.append(`<li class="page-item"><a class="page-link page-number" href="#">${i}</a></li>`)
                }
            }
        })
}

// КНОПКА ПЕРЕКЛЮЧЕНИЯ НА ПРЕД СТРАНИЦУ

prev.on("click",()=>{
    if (currentPage <= 1){
        return
    }
    currentPage--
    render()
})
// КНОПКА ПЕРЕКЛЮЧЕНИЯ НА СЛЕД СТРАНИЦУ
next.on("click",()=>{
    if (currentPage >= pageTotalCount){
        return
    }
    currentPage++
    render()
})

//КНОПКИ ДЛЯ ПЕРЕКЛЮЧЕНИЯ НА ОПРЕДЕЛЕННУЮ СТРАНИЦУ
$("body").on("click",".page-number", function (){
    currentPage = this.innerText; // обозначаем текущую страницу цифрой из кнопки
    render();
})


