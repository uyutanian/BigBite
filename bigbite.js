function () {

	var table, start, end, data = {};
	var cancelEvent = function (e) {
		e.stopPropagation();
		e.preventDefault();
	};
	var reset = function () {
		for (var key in data) {
			var pos = toPos(key);
			unset(pos.x, pos.y);
		}
		if (table) {
			table.classList.remove("BigBiteUnselectable");
		}
		table = start = end = null;
		data = {};
	};
	var set = function(o) {
		var x = getX(o);
		var y = getY(o);
		var id = toId(x, y);
		if (end === id) {
			return;
		}
		end = id;
		if (data[id] != null) {
			// 解除
			delete data[id];
			unset(x, y);
		} else {
			// 選択
			data[id] = o.td.textContent;
			o.td.classList.add("BigBiteSelected");
			if (start == null) {
				start = id;
			}
		}
	};
	var unset = function(x, y) {
		table.rows[y].cells[x].classList.remove("BigBiteSelected");
	};
	var getCell = function (event) {
		var o = {};
		var e = event.target;
		while (e) {
			switch ((name = e.nodeName.toLowerCase())) {
				case "th":
					name = "td";
					/* FALLTHROUGH */
				case 'td':
				case 'tr':
				case 'table':
					o[name] = e;
			}
			e = e.parentNode;
		}
		return o;
	};
	var toId = function (x, y) {
		return y + "-" + x;
	};
	var toPos = function(id) {
		var pos = id.split("-");
		return {x: pos[1], y: pos[0]};
	};
	var getY = function (o) {
		return o.tr.rowIndex
	};
	var getX = function (o) {
		return o.td.cellIndex;
	};
	var move = function (event) {
		if (!event.ctrlKey || event.which !== 1) {
			return;
		}
		var cell = getCell(event);
		if (!cell.td) {
			return;
		}
		if (!table) {
			table = cell.table;
		} else if (table != cell.table) {
			reset();
			cancelEvent(event);
			return;
		}
		//table.classList.add("BigBiteUnselectable");
		set(cell);
		cancelEvent(event);
	};
	var copy = function(event) {
		if (data) {
			var order = [];
			for (var key in data) {
				order[order.length] = key;
			}
			order.sort();
			var currentRowId, order = [], line = 0, colId = 0;
			for (var i = 0, len = order.length; i < len; i++) {
				var rowId = toPos(order[i]).y;
				if (currentRowId == null) {
					currentRowId = rowId;
				}
				var text = data[order[i]].trim();
				if (currentRowId != rowId) {
					// 改行
					currentRowId = rowId;
					line++;
					colId = 0;
				}
				if (!order[line]) {
					order[line] = [];
				}
				order[line][colId++] = text;
			}

			var text = "";
			for (var y = 0; y < order.length; y++) {
				text += order[y].join("\t") + "\r\n";
			}
			event.clipboardData.setData("text", text.slice(0, -2));
			reset();
			cancelEvent(event);
		}
	};
	var down = function(event) {
		if (event.which !== 1) {
			return;
		} else if (!event.ctrlKey) {
			// リセット
			reset();
			event.stopPropagation();
			return;
		}
		return move(event);
	};
	var up = function(event) {
		if (start || end) {
			start = end = null;
			cancelEvent(event);
		}
	};

	var init = function(window, document) {
		if (window.BigBite && window.BigBite.init) {
			return;
		}
		window.BigBite = { init: true };
		document.addEventListener('mouseup', up, true);
		document.addEventListener('mousedown', down, true);
		document.addEventListener('mousemove', move, true);
		document.addEventListener("copy", copy, true);
		var style = document.createElement('style');
		style.type = "text/css";
		document.getElementsByTagName('head').item(0).appendChild(style);
		style.sheet.insertRule("table.BigBiteUnselectable{-webkit-user-select:none}", 0);
		style.sheet.insertRule("th.BigBiteSelected,td.BigBiteSelected{box-shadow:-2px -1px blue inset}", 0);
	};

	for (var i = 0, w; w = window.frames[i]; i++) {
		w.addEventListener("load", function() {
			init(this, this.document);
		});
		init(w, w.document);
	}
	init(window, document);
}