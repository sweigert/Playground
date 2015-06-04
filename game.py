import pygame
import random
import colorsys
import sys


L = 90
R = -90
N = 0
S = 180

class Ant:
    def __init__(self, rule, xgrid, ygrid, gridsize, mysize):
        self.rule = rule
        self.gridpos = (xgrid, ygrid)
        self.size = mysize
        self.gridsize = gridsize
        self.direction = 0
        self.nextDirection = 0
        self.nextColorIdx = 0
        self.mutations = 0
    
    def __mutate(self):
        # there is no chance for mutation
        if (random.random() > 1):
            idx = random.randint(0, (len(self.rule) - 1))
            newRule = random.sample((L,R,N,S), 1)[0]
            self.rule[idx] = newRule
            self.mutations += 1

    def getWorldPos(self):
        return((self.gridpos[0] * self.size, self.gridpos[1] * self.size))

    def getRect(self):
        return((self.getWorldPos()[0], self.getWorldPos()[1], self.size, self.size))

    def applyRule(self, coloridx):
        self.__mutate()
        # switch to next color
        self.nextColorIdx = (coloridx + 1) % len(self.rule)
        # set direction based on current color and its rule
        self.nextDirection = (self.direction + self.rule[coloridx]) % 360

    def move(self):
        if self.nextDirection == 0:
            self.gridpos = (self.gridpos[0], ((self.gridpos[1] + 1) % self.gridsize))
        elif self.nextDirection == 90:
            self.gridpos = ((self.gridpos[0] + 1) % self.gridsize, self.gridpos[1])
        elif self.nextDirection == 180:
            self.gridpos = (self.gridpos[0], ((self.gridpos[1] - 1) % self.gridsize))
        elif self.nextDirection == 270:
            self.gridpos = ((self.gridpos[0] - 1) % self.gridsize, self.gridpos[1])

        self.direction = self.nextDirection

# Reformats a color tuple, that uses the range [0, 1] to a 0xFF
# representation.
def reformat (color):
    return int (round (color[0] * 255)), \
           int (round (color[1] * 255)), \
           int (round (color[2] * 255))

def maybe(value, alt = 0):
    if (random.random() > 0.5):
        return(value)
    else:
        return(alt)


def main():
    worldSize = 1024
    size = 10
    dims = int(worldSize / size)

    rule = [L,R]
    ## grows symmetrically, can't work together
    # rule = [L,L,R,R]
    ## grows chaotically, unknown emergent behavior
    # rule = [R,L,R]
    ## fills space in a square around itself, can work together
    # rule = [L,R,R,R,R,R,L,L,R]
    ## creates convoluted highway
    # rule = [L,L,R,R,R,L,R,L,R,L,L,R]
    ## creates a filled triangle shape that grows and moves
    # rule = [R,R,L,L,L,R,L,L,L,R,R,R]
    
    HSV = [(float(x)/len(rule), 0.5, 0.5) for x in range(len(rule))]
    colors = list(map(lambda x: reformat(colorsys.hsv_to_rgb(*x)), HSV))

    # init pygame
    pygame.init()
    clock = pygame.time.Clock()
    background = pygame.display.set_mode((worldSize, worldSize))
    screen = pygame.Surface((worldSize, worldSize), flags = (pygame.SRCALPHA | pygame.HWSURFACE))
    background.blit(screen, (0, 0))
    
    # init ants
    ants = []
    
    # init board
    board = {}
    for x in range(dims):
        for y in range(dims):
            board[(x,y)] = 0
    for cell in board:
        r, g, b = colors[0]
        screen.fill(pygame.Color(r, g, b), (cell[0]*size, cell[1]*size, size, size))
    
    iteration = 0
    reborn = 0
    while True:
        if (iteration % 10 == 0):
            if iteration > 0 and len(ants) > 0:
                mutations = 0
                for ant in ants:
                    mutations += ant.mutations

                sys.stdout.write(
                    '\r'
                    + 'Iteration: ' + "%010d" % iteration + ' | '
                    + '#Ants: ' + "%04d" % len(ants) + ' | '
                    + '#Reborn: ' + "%08d" % reborn + ' | '
                    + '#Mutations: ' + "%08d" % mutations + ' '
                    + '(' + "%06.1f" % round(float(mutations)/float(len(ants)), 1) + ')'
                )
                sys.stdout.flush()

                if (iteration % 1000 == 0):
                    pygame.image.save(screen, ("screen%010d.jpg" % iteration))
                
        # first, apply rules to all ants without changing the board
        dying = []
        for ant in ants:
            ant.applyRule(board[ant.gridpos])
            # ants die if mutated to often
            if ant.mutations > round(len(ant.rule)/8):
                dying.append(ant)

        # update board and ant positions
        for idx, ant in enumerate(ants):
            # color the board at the current position as dictated by the rules
            board[ant.gridpos] = ant.nextColorIdx
            r, g, b = colors[board[ant.gridpos]]
            screen.fill(pygame.Color(r, g, b), ant.getRect())

            # move ant to next position
            ant.move()
            r, g, b = colors[board[ant.gridpos]]
            screen.fill(pygame.Color((127+r)%256, (63-g)%256, (31+b)%256, 127), ant.getRect())

        # replace overly mutated ants
        for ant in dying:
            ants.remove(ant)
            ants.append(Ant(rule, ant.gridpos[0], ant.gridpos[1], dims, size))
            reborn += 1
            
        # update screen
        background.blit(screen, (0, 0))
        pygame.display.update()
        #clock.tick(30)

        iteration += 1

        # handle queued events
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                pygame.quit()
                sys.exit(0)
            elif event.type == pygame.MOUSEBUTTONDOWN:
                mousex, mousey = event.pos
                # for i in range(0, 100):
                #     ants.append(Ant(rule, random.randint(0, dims - 1), random.randint(0, dims - 1), dims, size))
                ants.append(Ant(rule, round(mousex/size), round(mousey/size), dims, size))
            elif event.type == pygame.KEYDOWN:
                key = event.key
                if key == pygame.K_ESCAPE:
                    rule = ()
                    print("Reset rule")
                elif key == pygame.K_l:
                    rule = rule + (L,)
                    print(rule)
                elif key == pygame.K_r:
                    rule = rule + (R,)
                    print(rule)
                elif key == pygame.K_RETURN:
                    assert(len(colors) >= len(rule))
                    assert(len(colors) % len(rule) == 0)
                    rule = (rule) * (len(colors)/len(rule))
                    print(len(rule), len(colors))
                    assert(len(rule) == len(colors))
                    print(rule)
                elif key == pygame.K_a:
                    mousex, mousey = pygame.mouse.get_pos()
                    ants.append(Ant(rule, round(mousex/size), round(mousey/size), dims, size))
                    ants.append(Ant(rule, round(mousex/size)+1, round(mousey/size), dims, size))
                    ants.append(Ant(rule, round(mousex/size), round(mousey/size)+1, dims, size))
                    ants.append(Ant(rule, round(mousex/size)+1, round(mousey/size)+1, dims, size))
                    ants.append(Ant(rule, round(mousex/size)-1, round(mousey/size)+1, dims, size))
                    ants.append(Ant(rule, round(mousex/size)-1, round(mousey/size)-1, dims, size))
                    ants.append(Ant(rule, round(mousex/size)-1, round(mousey/size), dims, size))
                    ants.append(Ant(rule, round(mousex/size), round(mousey/size)-1, dims, size))
                
if __name__ == "__main__":
    main()
