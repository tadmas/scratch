-module(larkdown).
-compile([export_all]).

-define(TAB, 9).
-define(SPACE, 32).

-define(TABSTOP, 4).

% The erlang unicode module only allows converting the whole binary to a list, whereas we need more of a binary:split
% style algorithm.  It's not as robust, but we can do character-by-character parsing using the binary utf8 syntax,
% and then throw it back together at the end.

-spec next_line(Utf8) -> {ok, Line, Rest} | {error, LineSoFar, Rest} when
	Utf8 :: binary(),
	Line :: string(),
	LineSoFar :: string(),
	Rest :: binary().
next_line(Utf8) -> next_line(Utf8, []).

next_line(<<"\r\n"/utf8, Rest/binary>>, Acc) -> {ok, lists:reverse(Acc), Rest};
next_line(<<"\r"/utf8,   Rest/binary>>, Acc) -> {ok, lists:reverse(Acc), Rest};
next_line(<<"\n"/utf8,   Rest/binary>>, Acc) -> {ok, lists:reverse(Acc), Rest};
next_line(<<Ch/utf8,     Rest/binary>>, Acc) -> next_line(Rest, [Ch | Acc]);
next_line(<<             Rest/binary>>, Acc) -> {error, lists:reverse(Acc), Rest}.

-spec fix_tabs(StrIn) -> StrOut when
	StrIn :: string(),
	StrOut :: string().
fix_tabs(Str) -> fix_tabs(Str, "", 0).

fix_tabs(Str, Acc, AccLen) ->
	case string:chr(Str, ?TAB) of
		0 -> lists:flatten(Acc) ++ Str;
		TabPos ->
			RealTabPos = AccLen + TabPos,
			NumSpaces = ?TABSTOP - ((RealTabPos-1) rem ?TABSTOP),
			{First, [?TAB | Rest]} = lists:split(TabPos-1, Str),
			NewAcc = [Acc, First, lists:duplicate(NumSpaces, ?SPACE)],
			NewAccLen = AccLen + (TabPos-1) + NumSpaces,
			fix_tabs(Rest, NewAcc, NewAccLen)
	end.
