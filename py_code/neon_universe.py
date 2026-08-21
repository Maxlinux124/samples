import pygame
import random
import sys

# Pygame Initialization
pygame.init()

# Screen Configuration
WIDTH, HEIGHT = 1200, 750
screen = pygame.display.set_mode((WIDTH, HEIGHT))
pygame.display.set_caption("Python Space Academy - Level Up!")
clock = pygame.time.Clock()

# Fonts
font_title = pygame.font.SysFont("consolas", 36, bold=True)
font_body = pygame.font.SysFont("consolas", 22)
font_hud = pygame.font.SysFont("consolas", 20, bold=True)

# ---------------------------------------------------------
# ANIMATED BACKGROUND: STARFIELD
# ---------------------------------------------------------
class BackgroundStar:
    def __init__(self):
        self.x = random.randint(0, WIDTH)
        self.y = random.randint(0, HEIGHT)
        self.speed = random.uniform(0.5, 2.5)
        self.size = random.randint(1, 3)

    def update(self):
        self.y += self.speed
        if self.y > HEIGHT:
            self.y = 0
            self.x = random.randint(0, WIDTH)

    def draw(self):
        pygame.draw.circle(screen, (200, 200, 255), (int(self.x), int(self.y)), self.size)

# Generate 150 background stars
stars = [BackgroundStar() for _ in range(150)]

# ---------------------------------------------------------
# GAME DATABASE (Levels, Questions, Options, Answers)
# ---------------------------------------------------------
game_levels = {
    1: {
        "title": "LEVEL 1: VARIABLES & DATA TYPES",
        "theory": "Variables data store karte hain. Eg: x = 5 (int), name = 'AI' (str).",
        "question": "Agar x = 5 aur y = '5' ho, to type(y) kya hoga?",
        "options": ["1. int", "2. str", "3. float", "4. bool"],
        "correct": 1 # Index 1 means "2. str"
    },
    2: {
        "title": "LEVEL 2: CONTROL FLOW (IF-ELSE)",
        "theory": "if-else condition check karne ke liye kaam aata hai.",
        "question": "Python me 'Not Equal To' check karne ka sahi symbol kya hai?",
        "options": ["1. <->", "2. not=", "3. !=", "4. =="],
        "correct": 2 # Index 2 means "3. !="
    },
    3: {
        "title": "LEVEL 3: LOOPS (ITERATION)",
        "theory": "for aur while loops code ko baar-baar repeat karte hain.",
        "question": "range(1, 5) total kitni baar execute hoga?",
        "options": ["1. 5 baar", "2. 4 baar", "3. 6 baar", "4. Infinite"],
        "correct": 1 # Index 1 means "2. 4 baar"
    },
    4: {
        "title": "LEVEL 4: FUNCTIONS (REUSABILITY)",
        "theory": "def keyword se function banta hai jo code reuse karne deta hai.",
        "question": "Function se value return karne ke liye kis keyword ka use hota hai?",
        "options": ["1. send", "2. give", "3. return", "4. export"],
        "correct": 2 # Index 2 means "3. return"
    }
}

# Player State
current_level_num = 1
score = 0
game_over = False
feedback_text = ""
feedback_color = (255, 255, 255)
feedback_time = 0

# ---------------------------------------------------------
# CORE LOGIC & UI DRAWING
# ---------------------------------------------------------
def draw_wrapped_text(surface, text, pos, font, color, max_width):
    """Bade text ko automatic wrap karke multiple lines me draw karta hai"""
    words = text.split(' ')
    space_width, space_height = font.size(' ')
    x, y = pos
    current_line = ""
    
    for word in words:
        test_line = current_line + word + " "
        if font.size(test_line)[0] < max_width:
            current_line = test_line
        else:
            surface.blit(font.render(current_line, True, color), (x, y))
            current_line = word + " "
            y += space_height
    surface.blit(font.render(current_line, True, color), (x, y))

# ---------------------------------------------------------
# MAIN GAME LOOP
# ---------------------------------------------------------
running = True
while running:
    # Screen background reset (Deep space color)
    screen.fill((10, 10, 25))

    # 1. Background Star Animation Chalao
    for star in stars:
        star.update()
        star.draw()

    # Mouse detection
    mx, my = pygame.mouse.get_pos()
    mouse_clicked = False

    # Event Handler
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False
        if event.type == pygame.MOUSEBUTTONDOWN:
            if event.button == 1: # Left Click
                mouse_clicked = True

    # 2. Top HUD Bar Draw Karo (Score and Level Status)
    pygame.draw.rect(screen, (20, 20, 50), (0, 0, WIDTH, 60))
    pygame.draw.line(screen, (0, 255, 200), (0, 60), (WIDTH, 60), 2)
    
    hud_lvl = font_hud.render(f"CURRENT LEVEL: {current_level_num if current_level_num <= len(game_levels) else 'MAX'}", True, (255, 255, 255))
    hud_scr = font_hud.render(f"SCORE: {score} XP", True, (0, 255, 200))
    screen.blit(hud_lvl, (30, 18))
    screen.blit(hud_scr, (WIDTH - 200, 18))

    # 3. Check Game Completion
    if current_level_num > len(game_levels):
        congrats_title = font_title.render("🎉 CONGRATULATIONS! YOU ARE A PYTHON PRO 🎉", True, (0, 255, 200))
        congrats_sub = font_body.render(f"Aapne saare levels successfully clear kar liye! Total Score: {score} XP", True, (255, 255, 255))
        screen.blit(congrats_title, (WIDTH//2 - congrats_title.get_width()//2, HEIGHT//2 - 50))
        screen.blit(congrats_sub, (WIDTH//2 - congrats_sub.get_width()//2, HEIGHT//2 + 20))
        
        pygame.display.flip()
        clock.tick(60)
        continue

    # Load Current Level Data
    level_data = game_levels[current_level_num]

    # 4. Display Level Title & Theory Box
    title_text = font_title.render(level_data["title"], True, (0, 255, 200))
    screen.blit(title_text, (50, 90))

    # Theory Card
    pygame.draw.rect(screen, (15, 30, 70), (50, 150, WIDTH - 100, 90), border_radius=8)
    pygame.draw.rect(screen, (0, 150, 255), (50, 150, WIDTH - 100, 90), width=2, border_radius=8)
    theory_lbl = font_hud.render("📚 LESSON CONTEXT:", True, (0, 150, 255))
    screen.blit(theory_lbl, (70, 160))
    draw_wrapped_text(screen, level_data["theory"], (70, 195), font_body, (220, 240, 255), WIDTH - 140)

    # 5. Display Question
    q_lbl = font_title.render("❓ QUESTION:", True, (255, 215, 0))
    screen.blit(q_lbl, (50, 270))
    draw_wrapped_text(screen, level_data["question"], (50, 320), font_body, (255, 255, 255), WIDTH - 100)

    # 6. Render MCQ Option Buttons (Clickable Grid/List)
    start_y = 390
    button_gap = 75
    
    for i, option in enumerate(level_data["options"]):
        btn_rect = pygame.Rect(50, start_y + (i * button_gap), WIDTH - 100, 60)
        
        # Check Hover Effect (Agar mouse button ke upar hai)
        if btn_rect.collidepoint(mx, my):
            btn_color = (30, 60, 120)     # Dark Blue highlighting
            border_color = (0, 255, 255)   # Glowing cyan border
            text_color = (0, 255, 255)
            
            # Agar hover ke sath user click bhi karde
            if mouse_clicked:
                if i == level_data["correct"]:
                    feedback_text = "🎯 CORRECT! Level Up! (+25 XP)"
                    feedback_color = (0, 255, 100)
                    score += 25
                    current_level_num += 1
                else:
                    feedback_text = "❌ OOPS! Wrong Answer. Try again!"
                    feedback_color = (255, 50, 50)
                feedback_time = pygame.time.get_ticks() # Timer start message ke liye
        else:
            btn_color = (20, 25, 45)       # Normal background
            border_color = (70, 80, 110)   # Normal border
            text_color = (200, 210, 230)

        # Draw Option Card
        pygame.draw.rect(screen, btn_color, btn_rect, border_radius=6)
        pygame.draw.rect(screen, border_color, btn_rect, width=2, border_radius=6)
        
        # Draw Option Text inside Card
        opt_text = font_body.render(option, True, text_color)
        screen.blit(opt_text, (75, start_y + (i * button_gap) + 18))

    # 7. Display Feedback Messages (Sahi/Galat notification animation)
    if feedback_text and pygame.time.get_ticks() - feedback_time < 2000: # 2 seconds tak dikhega
        feed_render = font_title.render(feedback_text, True, feedback_color)
        screen.blit(feed_render, (WIDTH//2 - feed_render.get_width()//2, HEIGHT - 65))

    pygame.display.flip()
    clock.tick(60)

pygame.quit()
sys.exit()