ExecuteScript([
'>25*"!dlrow ,olleH":v',
'                 v:,_@',
'                 >  ^'
]);

ExecuteScript([
'01->1# +# :# 0# g# ,# :# 5# 8# *# 4# +# -# _@'
]);

ExecuteScript([
'0v                                   ',
'"<@_ #! #: #,<*2-1*92,*25,+*92*4*55.0'
]);

ExecuteScript([
'2>:3g" "-!v\  g30          <',
' |!`"O":+1_:.:03p>03g+:"O"`|',
' @               ^  p3\" ":<',
'2 234567890123456789012345678901234567890123456789012345678901234567890123456789'
]);

function ExecuteScript(src) {
	var script = CreateInterpreter(src);
	print(script.execute());
}

function CreateInterpreter(src) {
	var playfield = ParseSource(src);
	var ipX = 0, ipY = 0;
	var direction = '>';
	var stack = CreateStack();
	
	var moveIP = function() {
		switch (direction) {
			case '>': ipX = (ipX + 1 + 80) % 80; break;
			case '<': ipX = (ipX - 1 + 80) % 80; break;
			case 'v': ipY = (ipY + 1 + 25) % 25; break;
			case '^': ipY = (ipY - 1 + 25) % 25; break;
		}
	};
	var binaryOp = function(instruction) {
		var a = stack.pop();
		var b = stack.pop();
		switch (instruction) {
			case '+': stack.push(b + a); break;
			case '-': stack.push(b - a); break;
			case '*': stack.push(b * a); break;
			case '/': stack.push(truncate(b / a)); break;
			case '%': stack.push(b % a); break;
			case '`': stack.push((b > a) ? 1 : 0); break;
			case '\\': stack.push(a); stack.push(b); break;
			case 'g': stack.push(playfieldAt(a, b).charCodeAt(0)); break;
		}
	};
	var put = function() {
		var a = stack.pop();
		var b = stack.pop();
		var v = stack.pop();
		playfield[a][b] = String.fromCharCode(v);
	}
	var truncate = function(n) { return n > 0 ? Math.floor(n) : Math.ceil(n); };
	var playfieldAt = function(y, x) {
		var v = playfield[y][x];
		return v === undefined ? ' ' : v;
	};
	var playfieldAtIP = function() { return playfieldAt(ipY, ipX); };
	var stepNext = function(output) {
		var instruction = playfieldAtIP();
		switch (instruction) {
			case '0': case '1': case '2': case '3': case '4': case '5': case '6':
			case '7': case '8': case '9': stack.push(+instruction); break;
			case '+': case '-': case '*': case '/': case '%': case '`': case '\\':
			case 'g': binaryOp(instruction); break;
			case 'p': put(); break;
			case '!': stack.push((stack.pop() == 0) ? 1 : 0); break;
			case '>': case '<': case 'v': case '^': direction = instruction; break;
			case '_': direction = ((stack.pop() == 0) ? '>' : '<'); break;
			case '|': direction = ((stack.pop() == 0) ? 'v' : '^'); break;
			case '?': direction = "><^v"[Math.floor(Math.random()*4)]; break;
			case ':': stack.push(stack.peek()); break;
			case '$': stack.pop(); break;
			case '#': moveIP(); break;
			case '@': return false;
			case '"': moveIP(); while (playfieldAtIP() != '"') {
				stack.push(playfieldAtIP().charCodeAt(0));
				moveIP(); }; break;
			case ',': output.push(String.fromCharCode(stack.pop())); break;
			case '.': output.push(stack.pop().toString()); break;
			case ' ': /* no-op */ break;
			default: throw 'Invalid instruction: ' + instruction;
		}
		moveIP();
		return true;
	};
	return {
		execute: function() {
			var output = [];
			while (stepNext(output));
			return output.join('');
		}
	};
}

function ParseSource(src) {
	var playfield = CreateArray(25, 80);

	for (var i = 0; i < src.length; i++)
		for (var j = 0; j < src[i].length; j++)
			playfield[i][j] = src[i][j];

	return playfield;
}

// http://stackoverflow.com/a/966938/3750
function CreateArray(length) {
	var arr = new Array(length || 0), i = length;
	if (arguments.length > 1) {
		var args = Array.prototype.slice.call(arguments, 1);
		while (i--) arr[length-1 - i] = CreateArray.apply(this, args);
	}
	return arr;
}

function CreateStack() {
	var items = [];
	var size = 0;
	return {
		pop: function() { return (size > 0) ? items[--size] : 0; },
		peek: function() { return (size > 0) ? items[size-1] : 0; },
		push: function(item) { items[size++] = item; }
	};
}