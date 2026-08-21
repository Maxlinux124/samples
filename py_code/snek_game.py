import pygame
import random
import sys

# ---- Game Initialization ----
pygame.init()

# Screen Sizes
SCREEN_WIDTH = 600
SCREEN_HEIGHT = 500
screen = pygame.display.set_mode((SCREEN_WIDTH, SCREEN_HEIGHT))
pygame.display.set_caption("🐍 Neon Snake Professional")

# Colors (Modern Neon Theme)
BG_COLOR = (15, 15, 26)       # Deep Dark Blue/Black
SNAKE_COLOR = (0, 255, 127)   # Spring Green (Neon)
FOOD_COLOR = (255, 46, 99)    # Neon Red/Pink
TEXT_COLOR = (255, 255, 255)  # White
GRID_COLOR = (25, 25, 40)     # Subtle Grid Lines

# Game Speed & Grid Setup
GRID_SIZE = 20
GRID_WIDTH = SCREEN_WIDTH // GRID_SIZE
GRID_HEIGHT = SCREEN_HEIGHT // GRID_SIZE
INITIAL_SPEED = 5

clock = pygame.time.Clock()

# ---- Fonts ----
font_score = pygame.font.SysFont("Helvetica", 24, bold=True)
font_gameover = pygame.font.SysFont("Helvetica", 40, bold=True)
font_msg = pygame.font.SysFont("Helvetica", 20)

def draw_grid():
    """Background ko modern dikhane ke liye halki lines"""
    for x in range(0, SCREEN_WIDTH, GRID_SIZE):
        pygame.draw.line(screen, GRID_COLOR, (x, 0), (x, SCREEN_HEIGHT))
    for y in range(0, SCREEN_HEIGHT, GRID_SIZE):
        pygame.draw.line(screen, GRID_COLOR, (0, y), (SCREEN_WIDTH, y))

def show_score(score):
    score_surface = font_score.render(f"Score: {score}", True, TEXT_COLOR)
    screen.blit(score_surface, (15, 15))

def game_over_screen(score):
    screen.fill(BG_COLOR)
    
    go_surface = font_gameover.render("GAME OVER", True, FOOD_COLOR)
    score_surface = font_score.render(f"Your Total Score: {score}", True, TEXT_COLOR)
    msg_surface = font_msg.render("Press 'R' to Restart or 'Q' to Quit", True, (150, 150, 150))
    
    # Text ko center me alignment dena
    screen.blit(go_surface, (SCREEN_WIDTH//2 - go_surface.get_width()//2, SCREEN_HEIGHT//3))
    screen.blit(score_surface, (SCREEN_WIDTH//2 - score_surface.get_width()//2, SCREEN_HEIGHT//2))
    screen.blit(msg_surface, (SCREEN_WIDTH//2 - msg_surface.get_width()//2, SCREEN_HEIGHT//2 + 60))
    
    pygame.display.flip()
    
    # Restart ya Quit ka wait karna
    waiting = True
    while waiting:
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                pygame.quit()
                sys.exit()
            if event.type == pygame.KEYDOWN:
                if event.key == pygame.K_q:
                    pygame.quit()
                    sys.exit()
                if event.key == pygame.K_r:
                    waiting = False
                    main_game()

# ---- Main Game Loop ----
def main_game():
    # Snake ki shuruati position (Middle of screen)
    snake = [(GRID_WIDTH // 2, GRID_HEIGHT // 2)]
    # Snake ki direction (Shuru me Right ja raha hai)
    direction = (1, 0)
    
    # Food spawn karna
    food = (random.randint(0, GRID_WIDTH - 1), random.randint(0, GRID_HEIGHT - 1))
    
    score = 0
    current_speed = INITIAL_SPEED
    
    running = True
    while running:
        # 1. Inputs/Events Handle Karna
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                pygame.quit()
                sys.exit()
                
            elif event.type == pygame.KEYDOWN:
                # Direction change (Apne hi peeche nahi mud sakta)
                if event.key == pygame.K_UP and direction != (0, 1):
                    direction = (0, -1)
                elif event.key == pygame.K_DOWN and direction != (0, -1):
                    direction = (0, 1)
                elif event.key == pygame.K_LEFT and direction != (1, 0):
                    direction = (-1, 0)
                elif event.key == pygame.K_RIGHT and direction != (-1, 0):
                    direction = (1, 0)
                    
        # 2. Movement Logic
        lead_x, lead_y = snake[0]
        new_head = (lead_x + direction[0], lead_y + direction[1])
        
        # Game Over Conditions: Wall se takrana ya Khud se takrana
        if (new_head[0] < 0 or new_head[0] >= GRID_WIDTH or 
            new_head[1] < 0 or new_head[1] >= GRID_HEIGHT or 
            new_head in snake):
            running = False
            break
            
        # Snake ki body me naya sar add karna
        snake.insert(0, new_head)
        
        # 3. Eating Food Logic
        if new_head == food:
            score += 10
            # Speed har food ke baad halki si badhegi (Game challenging banane ke liye)
            current_speed = INITIAL_SPEED + (score // 20)
            
            # Naya food aisi jagah banana jahan snake na ho
            while True:
                food = (random.randint(0, GRID_WIDTH - 1), random.randint(0, GRID_HEIGHT - 1))
                if food not in snake:
                    break
        else:
            # Agar khaana nahi khaya, toh pichla hissa mita do (chalne ka effect)
            snake.pop()
            
        # 4. Drawing/Graphics Rendering
        screen.fill(BG_COLOR)
        draw_grid()
        
        # Draw Food (Glow effect dene ke liye halka border)
        food_rect = pygame.Rect(food[0] * GRID_SIZE, food[1] * GRID_SIZE, GRID_SIZE, GRID_SIZE)
        pygame.draw.rect(screen, FOOD_COLOR, food_rect, border_radius=4)
        
        # Draw Snake (Slightly rounded segments)
        for segment in snake:
            snake_rect = pygame.Rect(segment[0] * GRID_SIZE, segment[1] * GRID_SIZE, GRID_SIZE - 2, GRID_SIZE - 2)
            pygame.draw.rect(screen, SNAKE_COLOR, snake_rect, border_radius=4)
            
        show_score(score)
        
        pygame.display.flip()
        clock.tick(current_speed)
        
    # Game Over Screen call karna agar loop se bahar aaye
    game_over_screen(score)

# Game start karne ke liye
if __name__ == "__main__":
    main_game()