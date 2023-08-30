# odin-tictactoe
Repo for the tic tac toe project in the javascript course of the Odin Project

Intent is to implement a browser tic tac toe game and utilize javascript objects 

# Process

8/24/23
- Begin with creating skeleton of files (html, js, css)
- Start sketching out the design in freeform
    - Need:
        - title
        - the game board
        - score 
        - buttons to start and play again 

<img src="source/freeform_sketch/Screenshot 2023-08-24 at 8.56.21 PM.png" width=400>

- Maybe play with the colors, I like things more sleek in general
- Began implementing html/css to achieve the freeform design
    - As always, ideas came to me while implementing.
- Create the gameboard via grid and use the background of the grid to be the actual board axes

8/28/23
- Finalized MVP
- Game works as expected
- Created objects for gameboard, gamemanager, display manager, and player
    - gameboard (IIFE) handles the manipulation of the internal board. error checks user selections and win conditions
    - gamemanager (IIFE) initializes the players, gameboard, and display and also processes turns
    - display manager (IIFE) updates the dom with relevant info (game pieces, log information)
    - players (factory function) are basic objects with a name and a piece (x, o) assigned

8/29/23
- Noted and fixed two areas where code could be cleaned up in git issues
- Showed game to wife, she suggested removing the log history as it is only adding confusion
    - Change log history to chronically show players pieces and only show latest "who's turn" statement
- Cleaned up player init
- Added tie logic
- Added play again feature
- Added player configuration form (shows option to play com but still not implemented)

TODO:
    - COM 
    - Score Tally