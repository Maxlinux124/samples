import pygame
import math

pygame.init()

WIDTH, HEIGHT = 1200, 700
screen = pygame.display.set_mode((WIDTH, HEIGHT))
pygame.display.set_caption("Spider Web Cursor")

clock = pygame.time.Clock()

points = []

running = True

while running:

    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False

    mx, my = pygame.mouse.get_pos()

    points.append([mx, my, 100])

    if len(points) > 150:
        points.pop(0)

    screen.fill((10, 10, 15))

    for p in points:
        p[2] -= 1

    points = [p for p in points if p[2] > 0]

    for i in range(len(points)):
        for j in range(i + 1, len(points)):

            x1, y1, life1 = points[i]
            x2, y2, life2 = points[j]

            dist = math.hypot(x2 - x1, y2 - y1)

            if dist < 80:

                alpha = max(0, 255 - int(dist * 3))

                color = (100, 200, 255)

                pygame.draw.line(
                    screen,
                    color,
                    (x1, y1),
                    (x2, y2),
                    1
                )

    pygame.draw.circle(
        screen,
        (255, 255, 255),
        (mx, my),
        5
    )

    pygame.display.flip()
    clock.tick(60)

pygame.quit()