-module(markdown).
-compile([export_all]).

-define(CR, 13).
-define(LF, 10).

encode(Input) ->
	L = lex(Input),
	P = parse(L),
	to_html(P).

lex(Input) when is_list(Input) ->
	lex(list_to_binary(Input), [], []);
lex(Input) when is_binary(Input) ->
	lex(Input, [], []).

lex(<<>>, [], BodyAcc) ->
	lists:reverse(BodyAcc);
lex(<<>>, TextAcc, BodyAcc) ->
	lex(<<>>, [], [lex_text(TextAcc) | BodyAcc]);
lex(<<?CR, ?LF, Rest/binary>>, TextAcc, BodyAcc) ->
	lex(Rest, [], [eol, lex_text(TextAcc) | BodyAcc]);
lex(<<Ch, Rest/binary>>, TextAcc, BodyAcc) ->
	lex(Rest, [Ch | TextAcc], BodyAcc).

lex_text([]) -> blank;
lex_text(T) -> {text, lists:reverse(T)}.

parse(Lex) ->
	parse(Lex, [], []).

parse([], [], Acc) ->
	lists:reverse(Acc);
parse([], P, Acc) ->
	parse([], [], parse_acc_paragraph(P, Acc));
parse([blank, eol | Rest], P, Acc) ->
	parse(Rest, [], parse_acc_paragraph(P, Acc));
parse([eol | Rest], P, Acc) ->
	parse(Rest, [eol | P], Acc);
parse([{text, T} | Rest], P, Acc) ->
	parse(Rest, [{text, T} | P], Acc).

parse_acc_paragraph([], Acc) -> Acc;
parse_acc_paragraph(P, Acc) -> [{paragraph, lists:reverse(P)} | Acc].

to_html(Parse) -> to_html(Parse, []).

to_html([], Acc) ->
	lists:reverse(Acc);
to_html([{paragraph, P} | Rest], Acc) ->
	to_html(Rest, [["<p>", to_html(P), "</p>"] | Acc]);
to_html([eol], Acc) ->
	to_html([], Acc);
to_html([eol | Rest], Acc) ->
	to_html(Rest, [" " | Acc]);
to_html([{text, T} | Rest], Acc) ->
	to_html(Rest, [html_encode(T) | Acc]).

html_encode(Text) -> html_encode(Text, []).

html_encode([], Acc) -> lists:reverse(Acc);
html_encode([$< | Rest], Acc) -> html_encode(Rest, ["&lt;" | Acc]);
html_encode([$> | Rest], Acc) -> html_encode(Rest, ["&gt;" | Acc]);
html_encode("&amp;" ++ Rest, Acc) -> html_encode(Rest, ["&amp;" | Acc]);
html_encode("&nbsp;" ++ Rest, Acc) -> html_encode(Rest, ["&nbsp;" | Acc]);
html_encode([$& | Rest], Acc) -> html_encode(Rest, ["&amp;" | Acc]);
html_encode([Ch | Rest], Acc) -> html_encode(Rest, [Ch | Acc]).
