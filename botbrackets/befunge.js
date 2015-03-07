// for testing
var $Round = 1;
var $1 = { Seed: 5 };
var $2 = { Seed: 12 };
var $Score1 = 15;
var $Score2 = 30;
var debug = false;

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

/*ExecuteScript([
'2>:3g" "-!v\  g30          <',
' |!`"O":+1_:.:03p>03g+:"O"`|',
' @               ^  p3\" ":<',
'2 234567890123456789012345678901234567890123456789012345678901234567890123456789'
]);*/


// Test that "current object" functionality works.
/* High Seed Wins   */ print("High Seed"); ExecuteScript(['1c[Seed]2c[Seed]-.@']);
/* Low Seed Wins    */ print("Low Seed");  ExecuteScript(['2c[Seed]1c[Seed]-.@']);
/* Split the Middle */ print("Scores");    ExecuteScript(['3cn.67+,55+,4cn.@']); // not actually split the middle due to division

// Test loop with single property name.
//debug = true;
print("High Seed with loop");
ExecuteScript([
'v   v c2 -1  <    ',
'>11c>[Seed]~:|    ',
'             >$-.@',
]);

print("Absolute value of seed difference");
ExecuteScript([
' v   v c2 -1  <      >   v   ',
' >11c>[Seed]~:|>$-:0`|   >.@ ',
'              >^     >0~-^   ',
]);

print("Bail early if seed difference > 12");
ExecuteScript([
' v   v c2 -1  <       >   v    @         ',
' >11c>[Seed]~:|>$-::0`|   >66+`|         ',
'              >^      >0~-^    >$"KO",,@ ',
]);


/*

Language additions:

c = pop A off stack and load "current object" based on A:
	0 = $Round
	1 = $1
	2 = $2
	3 = $Score1
	4 = $Score2
	other = undefined behavior

n = push current_object (converted to an integer) onto stack
[...] = read text between [] like "", then push current_object[text] onto stack
{...} = read text between {} like "", then set current_object = current_object[text]

~ = synonym for \\ since that takes up two characters in JS string literals

*/

/*

         1         2         3         4         5         6         7         8
12345678901234567890123456789012345678901234567890123456789012345678901234567890


Process for specifying the property name once:

        v c2    -1  <
   1 1c > [Seed] ~: |
                    @

Bail out early if the seed difference is too high (13?)

Absolute value:

  v     v c2     -1 <          >       v
  >1 1c > [Seed] ~: |> $ - :0` |
                    >^         > 0 ~ - > .@

Add comparison:

  v     v c2     -1 <          >       v
  >1 1c > [Seed] ~: |> $ - :0` |             > "Bail",,,,@
                    >^         > 0 ~ - > 66+`|
                                             > "OK",,@

*/



function ExecuteScript(src) {
	var script = CreateInterpreter(src);
	var results = script.execute();
	print(results.output);
	if (results.value) {
		print("Returned: " + results.value);
		print();
	}
}

function CreateInterpreter(src) {
	var playfield = ParseSource(src);
	var ipX = 0, ipY = 0;
	var direction = '>';
	var stack = CreateStack();
	var curObj = null;
	
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
			case '~': stack.push(a); stack.push(b); break; // synonym for backslash
			case 'g': stack.push(playfieldAt(a, b).charCodeAt(0)); break;
		}
	};
	var slurp = function() {
		var untilChars = Array.prototype.slice.call(arguments);
		var s = "";
		moveIP();
		while (untilChars.indexOf(playfieldAtIP()) < 0)
		{
			s += playfieldAtIP();
			moveIP();
		}
		return s;
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
		if (debug) print(instruction + " @ " + ipX + "," + ipY + " going " + direction + " with stack " + stack.toString());
		switch (instruction) {
			case '0': case '1': case '2': case '3': case '4': case '5': case '6':
			case '7': case '8': case '9': stack.push(+instruction); break;
			case '+': case '-': case '*': case '/': case '%': case '`': case '\\':
			case 'g': case '~': binaryOp(instruction); break;
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
			/* BOTBRACKETS-SPECIFIC EXTENSIONS */
			case 'c': curObj = [$Round,$1,$2,$Score1,$Score2][stack.pop()]; break;
			case 'n': stack.push(truncate(+curObj)); break;
			case '[': case ']': stack.push(truncate(+curObj[slurp('[', ']')])); break;
			case '{': case '}': curObj = curObj[slurp('{', '}')]; break;
			default: throw 'Invalid instruction: ' + instruction;
		}
		moveIP();
		return true;
	};
	return {
		execute: function() {
			var output = [];
			while (stepNext(output));
			return { output: output.join(''), value: stack.pop() };
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
		push: function(item) { items[size++] = item; },
		toString: function() { return "" + items.slice(0, size); }
	};
}