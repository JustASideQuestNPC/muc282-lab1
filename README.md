# MUC 282 - Project 0: Design on the Web

This was the first project in this class. The maze generator uses
    <a href="https://weblog.jamisbuck.org/2010/12/27/maze-generation-recursive-backtracking"
        target="_blank" rel="noopener noreferrer">
        Recursive Backtracking
    </a>, which works like this:
    
1. Start with a grid of unconnected cells.
2. Choose a random cell to start with. That cell is now the start of the "path".
3. Look at each cell that's adjacent to the last cell in the path.
4. If any of the adjacent cells aren't already part of the maze, choose a random one, carve into it,
   and add it to the end of the path.
6. If all the cells are already part of the maze, step backward to the previous cell in the path.
7. Repeat steps 3-5 until you step all the way back to the very start of the path.
    