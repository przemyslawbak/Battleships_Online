#Battleships Online

This game can be played at: http://battleships-api.testuj-strone.com.pl
Be noted, that SSL is not used in this demo.

Battleships is a simple online game using classic rules:
https://en.wikipedia.org/wiki/Battleship_(game)

To play it, you must first register a new user or you can use previously created user accounts. It is possible to use non-existent email address to create new user. Their existence will not be verified at any stage of user registration. Using Facebook and Goole accounts is blocked due to not used SSL.

Main game features:
- creating and editing a user profile,
- browsing various tabs related to the game,
- online game for one or two players,
- single player game with three different levels of difficulty,
- three different game speeds,
- viewing the results of the best players,
- viewing the list of open games,
- ability to join an open game, or using a link,
- logging in using OAuth (with no SSL it is disabled),
- ReCaptcha v3 (with no SSL it is disabled).

Created fake accounts:
email: clicker1@email.com
password: clicker1

email: clicker2@email.com
password: clicker2

Technical features:
This is Angular 11 SPA with ASP.NET Core 2.2 Web API.