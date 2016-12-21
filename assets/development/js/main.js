/* Logic for ordering via thead elements:
 1) Loop through thead th elements, create array containing the ones with the class "sortable" to allow the table maker person to only let some columns be sortable
 2) Loop through tbody trs and create array with keys the same the th elements, and a value
 3) On sort, clear tbody of all trs
 4) Loop through the tr array, create elements and add them to tbody
 */
var manipulatable = function(element){
    var _ = this;
    _.classes = {
        'sortable': 'sortable',
        'down': 'sortable--down',
        'up': 'sortable--up',
        'th': 'thead th',
        'tr': 'tbody tr'
    };
    _.element = element;
    _.tables = document.querySelectorAll(_.element);
    _.tableRows = [];
    _.sortableKeys = []; /* Where we store values that we can use to sort the taable rows */
    _.switchArrow = function(self, dir){
        if(self.classList.contains(_.classes.up)){
            self.classList.remove(_.classes.up);
            self.classList.add(_.classes.down);
        } else {
            self.classList.remove(_.classes.down);
            self.classList.add(_.classes.up);
        }
    };

    _.sortByKey = function(key,desc) {
        return function(a,b){
            return desc ? ~~(a[key] < b[key]) : ~~(a[key] > b[key]);
        }
    };

    _.sort = function(){
        var dir = 'up';
        _.switchArrow(this, dir);
        if(this.classList.contains(_.classes.up)){
            _.tableRows = _.tableRows.sort(_.sortByKey(this.innerHTML, true));
        } else {
            _.tableRows = _.tableRows.sort(_.sortByKey(this.innerHTML));
        }
        for(var t = 0; t < _.tables.length; t++){
            var thisTable = _.tables[t];
            var thisTableTbody = thisTable.querySelector('tbody');
            thisTableTbody.innerHTML = '';
            for(var tr = 0; tr < _.tableRows.length; tr++){
                var thisRow = _.tableRows[tr];
                var rowElement = document.createElement('tr');
                for(var key in thisRow){
                    var text = document.createTextNode(thisRow[key]);
                    var td = document.createElement('td');
                    td.appendChild(text);
                    rowElement.appendChild(td);
                }
                thisTableTbody.appendChild(rowElement);
            }
        }
    };

    _.init = function(){
        for(var i = 0; i < _.tables.length; i++){
            var thisTable = _.tables[i];

            var ths = thisTable.querySelectorAll(_.classes.th);
            for(var t = 0; t< ths.length; t++){
                var thisTh = ths[t];
                if(thisTh.classList.contains(_.classes.sortable)){
                    thisTh.addEventListener('click', _.sort);
                }
                _.sortableKeys.push(thisTh.innerHTML);
            }

            var trs = thisTable.querySelectorAll(_.classes.tr);
            for(var tr = 0; tr < trs.length; tr++){
                var thisTr = trs[tr];
                var thisTrTds = thisTr.querySelectorAll('td');
                var tempTrArray = [];
                for(var ttt = 0; ttt < thisTrTds.length; ttt++){
                    tempTrArray[_.sortableKeys[ttt]] = thisTrTds[ttt].innerHTML;
                }
                _.tableRows.push(tempTrArray);
            }

            console.log(_.sortableKeys);
            console.log(_.tableRows);
        }
    };
    _.init();
};

var table = new manipulatable('.manipulatable');