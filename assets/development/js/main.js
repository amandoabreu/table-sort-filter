/* Logic for ordering via thead elements:
 1) Loop through thead th elements, create array containing the ones with the class "sortable" to allow the table maker person to only let some columns be sortable
 2) Loop through tbody trs and create array with keys the same the th elements, and a value
 3) On sort, clear tbody of all trs
 4) Loop through the tr array, create elements and add them to tbody
 */

(function($) {
    $.fn.manipulatable = function(params) {
        return $(this).each(function() {
            var self = $(this);
            var tableRows = [];
            var columnNames = [];
            self.addData = function(data){
                data.forEach(function(d){
                    if(columnNames.length == 0){
                        for(var key in d){
                            columnNames.push(key);
                        }
                    }
                    tableRows.push(d);
                });
                self.controls();
                self.updateTable();
            };

            self.filterRows = function(values){
                var tempRows = null;
                if(typeof values[1] !== 'undefined'){ // Contains a value for a key to sort on
                    tempRows = tableRows.filter(function (el) {
                        return el[values[0]] == values[1];
                    });
                } else {
                    tempRows = tableRows.map(function(object){
                        for(var oKey in object){
                            if(object[oKey] == values[0]) return object
                        }
                    });

                }
                self.updateTable(tempRows);
                /*tableRows = tableRows.filter(function (el) {
                    return 0;
                });*/
            };

            self.sortByKey = function(key,desc) {
                /*

                    TODO fix sorting
                 */
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

            self.sort = function(){
                $(this).toggleClass('sort-up');
                var rows = tableRows.sort(self.sortByKey(this.innerHTML, $(this).hasClass('sort-up')));

                self.updateTable(rows);
            };

            self.updateTable = function(rows){
                var useRows = rows ? rows : tableRows; // Use tableRows if no other rows have been set
                self.children('tbody').remove(); // Clear previous tbody
                if(!self.has('thead').length) {
                    var thead = document.createElement('thead');
                    var theadTr = document.createElement('tr');
                    columnNames.forEach(function (columnName) {
                        var text = document.createTextNode(columnName);
                        var th = document.createElement('th');
                        th.classList.add(columnName);
                        th.appendChild(text);
                        th.addEventListener('click', self.sort);
                        if ($('.checkbox_' + columnName + ':checked').length < 1) {
                            $(th).addClass('cellHidden');
                        }
                        th.dataset.sort = columnName;
                        theadTr.appendChild(th);

                    });
                    thead.appendChild(theadTr);
                    self.append(thead);
                }

                var tbody = document.createElement('tbody');
                useRows.forEach(function(row){
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
                self.append(tbody);
            };

            self.init = function(){
                $.ajax({
                    url: 'data.json',
                    dataType: 'json',
                    success: function (data) {
                        self.addData(data);
                    }
                });

            };

            self.controls = function(){
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
                    var filterValues = this.value.split(':');
                    self.filterRows(filterValues);
                });
                form.addEventListener('submit', function(e){
                    e.preventDefault();
                });
                form.appendChild(input);
                settingsWrapper.append(form);
            };

            self.init();

        });
    }
})(jQuery);

$('.manipulatable').manipulatable();

$('.open-view-settings').click(function(){
    $('body').toggleClass('body--view-settings-active')
});