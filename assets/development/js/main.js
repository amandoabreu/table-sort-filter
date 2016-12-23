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

        var init = function(){
            $.ajax({
                url: 'data.json',
                success: function (data) {
                    addData(data);
                }
            });
        };

        var addData = function(data){
            data.forEach(function(row){
                if(columnNames.length == 0){
                    for(var key in row){
                        columnNames.push(key);

                    }
                }

                Object.keys(row).map(function(key, index) {
                    var tempFriends = [];
                    if(key == 'name') row.name = [row.name.first, row.name.last].join(' ');
                    //if(key == 'name') row[key] = [row[key].first, row[key].last].join(' ');
                    if(key == 'friends'){
                        row[key].forEach(function(friend) {
                            tempFriends.push(friend.name);
                        });
                        row.friends = tempFriends.join(' ');
                    }
                });
                tableRows.push(row);
            });
            controls();
            updateTable();
        };

        var filterRows = function(values){
            if(values.length > 0){
                filter = values.split(':');
                if(typeof filter[1] !== 'undefined'){ // Probably contains a value for a key to sort on
                    console.log('Filtering by '+filter[0]+' = '+filter[1]);
                    modifiedRows = tableRows.filter(function (el) {
                        return el[filter[0]] == filter[1];
                    });
                } else { // Search all columns?
                    console.log('Filtering by value = '+filter[0]);
                    modifiedRows = tableRows.map(function(object){
                        for(var oKey in object){
                            if(object[oKey] == values[0]) return object
                        }
                    });

                }
                updateTable(modifiedRows);
            } else {
                modifiedRows = [];
                filter = '';
                console.log('No filter');
                updateTable();
            }
        };

        var sortByKey = function(key,desc) {
            console.log('Sorting by '+key+', desc: '+desc);
            return function(a,b){
                a = a[key];
                a = String(a).toLowerCase();
                b = b[key];
                b = String(b).toLowerCase();
                return desc ? ~~(b.localeCompare(a)) : ~~(a.localeCompare(b));
            };
        };

        var sort = function(){ // runs when th is clicked
            $(this).toggleClass('sort-up');
            var sortRows = modifiedRows.length == 0 ? tableRows : modifiedRows;

            modifiedRows = sortRows.sort(sortByKey(this.dataset.orderby, $(this).hasClass('sort-up')));

            updateTable(modifiedRows);
        };

        var updateTable = function(rows){
            var outputRows = rows && filter != '' ? rows : tableRows;
            thisTable.children('tbody').remove(); // Clear previous tbody
            if(!thisTable.has('thead').length) {
                var thead = document.createElement('thead');
                var theadTr = document.createElement('tr');
                columnNames.forEach(function (columnName) {
                    var text = document.createTextNode(columnName);
                    var th = document.createElement('th');
                    th.setAttribute('data-orderby', columnName);
                    th.classList.add(columnName);
                    th.appendChild(text);
                    th.addEventListener('click', sort);
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


        var controls = function(){
            var columnHide = document.getElementById('hide');
            columnNames.forEach(function(columnName){
                var checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.classList.add('checkbox_'+columnName);
                checkbox.addEventListener('click', function(){
                    $('.'+this.value).toggleClass('cellHidden');
                });
                checkbox.value = columnName;
                checkbox.checked = 'checked';
                columnHide.append(checkbox);
                columnHide.append(columnName);
            });
            var input = document.createElement('input');
            input.classList.add('rows-filter');
            input.setAttribute('placeholder', 'Filter, column:string, press enter');
            $('.filter-form').on('submit', function(e){
                filterRows($(this).children('.filter-rows').val());
                e.preventDefault();
            });
        };

        init();
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