/*
 Logic for ordering and filtering to live well together:
 1) Load data.json into tableRows Array
 2) updateTable() -> create thead and tbody based on keys and values
 3) if(user sorts){
    1) create modifiedRows = tableRows and apply changes here, pass this to updateTable()
 4) if(user filters){
    1) create modifiedRows if it doesn't exist, assign it filtered tableRows
    2) filter always from original array
 */

(function($) {

    var manipulaTable = function(elem, params){
        var thisTable = elem;
        var _ = $(this);

        var tableRows = []; // tableRows equal to file
        var modifiedRows = []; // To store modifications to the tableRows array
        var columnNames = []; // Column names
        var filter = ''; // Storing filter information

        _.init = function(){
            $.ajax({
                url: 'data.json',
                dataType: 'json',
                success: function (data) {
                    _.addData(data);
                }
            });
        };

        _.addData = function(data){
            data.forEach(function(d){
                if(columnNames.length == 0){
                    for(var key in d){
                        columnNames.push(key);
                    }
                }
                tableRows.push(d);
            });
            _.controls();
            _.updateTable();
        };

        _.filterRows = function(values){
            if(values.length > 0){
                filter = values.split(':');
                if(typeof filter[1] !== 'undefined'){ // Probably contains a value for a key to sort on
                    console.log('Filtering by '+filter[0]+' = '+filter[1]);
                    modifiedRows = tableRows.filter(function (el) {
                        return el[filter[0]] == filter[1];
                    });
                } else {
                    console.log('Filtering by value = '+filter[0]);
                    modifiedRows = tableRows.map(function(object){
                        for(var oKey in object){
                            if(object[oKey] == values[0]) return object
                        }
                    });

                }
                _.updateTable(modifiedRows);
            } else {
                modifiedRows = [];
                filter = '';
                console.log('No filter');
                console.log(modifiedRows);
                _.updateTable();
            }
        };

        _.sortByKey = function(key,desc) {
            /* TODO fix sorting  */
            console.log('Sorting by['+key+'] desc: '+desc);
            return function(a,b){
                if(isNaN(a[key] && isNaN(b[key]))) {
                    return desc ? ~~(a[key] < b[key]) : ~~(a[key] > b[key]);
                } else if(key == 'balance'){
                    return desc ? parseInt(a[key].replace('$','').replace(',','')) - parseInt(b[key].replace('$','').replace(',',''))
                        : parseInt(b[key].replace('$','').replace(',','')) - parseInt(a[key].replace('$','').replace(',',''))
                } else {
                    return desc ? b[key] - a[key] : a[key] - b[key];
                }
            }
        };

        _.sort = function(){
            $(this).toggleClass('sort-up');
            if(modifiedRows.length == 0){
                modifiedRows = tableRows.sort(_.sortByKey(this.innerHTML, $(this).hasClass('sort-up')));
            } else {
                modifiedRows = modifiedRows.sort(_.sortByKey(this.innerHTML, $(this).hasClass('sort-up')));
            }

            _.updateTable(modifiedRows);
        };

        _.updateTable = function(rows){
            var outputRows = rows && filter != '' ? rows : tableRows;
            thisTable.children('tbody').remove(); // Clear previous tbody
            if(!thisTable.has('thead').length) {
                var thead = document.createElement('thead');
                var theadTr = document.createElement('tr');
                columnNames.forEach(function (columnName) {
                    var text = document.createTextNode(columnName);
                    var th = document.createElement('th');
                    th.classList.add(columnName);
                    th.appendChild(text);
                    th.addEventListener('click', _.sort);
                    if ($('.checkbox_' + columnName + ':checked').length < 1) {
                        $(th).addClass('cellHidden');
                    }
                    th.dataset.sort = columnName;
                    theadTr.appendChild(th);

                });
                thead.appendChild(theadTr);
                thisTable.append(thead);
            }

            var tbody = document.createElement('tbody');
            outputRows.forEach(function(row){
                var tbodyTr = document.createElement('tr');
                for(key in row){
                    var text = document.createTextNode(row[key]);
                    var td = document.createElement('td');
                    td.classList.add(key);

                    td.appendChild(text);
                    if(key == 'about'){
                        td.classList.add('long-text');
                    }

                    if($('.checkbox_'+key+':checked').length < 1){
                        $(td).addClass('cellHidden');
                    }
                    tbodyTr.appendChild(td);
                }
                tbody.appendChild(tbodyTr);


            });
            thisTable.append(tbody);
        };


        _.controls = function(){
            var settingsWrapper = $('.view-settings');
            var form = document.createElement('form');
            form.classList.add('filter-form');
            columnNames.forEach(function(columnName){
                var text = document.createTextNode(columnName);
                var checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.classList.add('checkbox_'+columnName);
                checkbox.addEventListener('click', function(){
                    $('.'+this.value).toggleClass('cellHidden');
                });
                checkbox.value = columnName;
                checkbox.checked = 'checked';
                form.append(checkbox);
                form.append(columnName);
            });
            var input = document.createElement('input');
            input.classList.add('rows-filter');
            input.setAttribute('placeholder', 'Filter, column:string');
            input.addEventListener('change', function(){
                _.filterRows(this.value);
            });
            form.addEventListener('submit', function(e){
                e.preventDefault();
            });
            form.appendChild(input);
            settingsWrapper.append(form);
        };

        _.init();
    };

    $.fn.manipulatable = function(params) {
        var element = $(this);
        return element.each(function() {
            new manipulaTable(element, params);
        });
    }
})(jQuery);

$('.manipulatable').manipulatable();

$('.open-view-settings').click(function(){
    $('body').toggleClass('body--view-settings-active')
});