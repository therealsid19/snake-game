'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

const SPACE_SIZE = 50;
const SPEED = 100;

export default function SnakeGame() {
    const canvasRef = useRef(null);
    const [direction, setDirection] = useState('down');
    const [snake, setSnake] = useState([{ x: 0, y: 0 }]);
    const [food, setFood] = useState({ x: 0, y: 0 });
    const [score, setScore] = useState(0);
    const [gameInterval, setGameInterval] = useState(null);
    const [isGameOver, setIsGameOver] = useState(false);
    const [gameWidth, setGameWidth] = useState(1300);
    const [gameHeight, setGameHeight] = useState(500);

    useEffect(() => {
        const handleResize = () => {
            setGameWidth(window.innerWidth);
            setGameHeight(window.innerHeight);
        };

        document.addEventListener('keydown', changeDirection);
        window.addEventListener('resize', handleResize);
        
        handleResize();

        return () => {
            document.removeEventListener('keydown', changeDirection);
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    useEffect(() => {
        if (gameInterval) {
            clearInterval(gameInterval);
        }
        if (!isGameOver) {
            const interval = setInterval(() => nextTurn(), SPEED);
            setGameInterval(interval);

            return () => clearInterval(interval);
        }
    }, [direction, snake, isGameOver]);

    const startGame = useCallback(() => {
        setSnake([{ x: 0, y: 0 }]);
        setDirection('down');
        setScore(0);
        setFood(getRandomFoodPosition());
        setIsGameOver(false);
        if (gameInterval) {
            clearInterval(gameInterval);
        }
    }, [gameInterval]);

    const getRandomFoodPosition = useCallback(() => {
        return {
            x: Math.floor(Math.random() * (gameWidth / SPACE_SIZE)) * SPACE_SIZE,
            y: Math.floor(Math.random() * (gameHeight / SPACE_SIZE)) * SPACE_SIZE
        };
    }, [gameWidth, gameHeight]);

    const nextTurn = useCallback(() => {
        const newSnake = [...snake];
        const head = { ...newSnake[0] };

        switch (direction) {
            case 'up':
                head.y -= SPACE_SIZE;
                break;
            case 'down':
                head.y += SPACE_SIZE;
                break;
            case 'left':
                head.x -= SPACE_SIZE;
                break;
            case 'right':
                head.x += SPACE_SIZE;
                break;
        }

        newSnake.unshift(head);

        if (head.x === food.x && head.y === food.y) {
            setScore(score + 1);
            setFood(getRandomFoodPosition());
        } else {
            newSnake.pop();
        }

        if (checkCollision(newSnake)) {
            gameOver();
        } else {
            setSnake(newSnake);
            drawGame(newSnake);
        }
    }, [direction, snake, food, score, getRandomFoodPosition]);

    const changeDirection = useCallback((event) => {
        const key = event.key;

        if (isGameOver) return;

        setDirection(prevDirection => {
            const newDirection = (key === 'ArrowUp' && prevDirection !== 'down') ? 'up' :
                                 (key === 'ArrowDown' && prevDirection !== 'up') ? 'down' :
                                 (key === 'ArrowLeft' && prevDirection !== 'right') ? 'left' :
                                 (key === 'ArrowRight' && prevDirection !== 'left') ? 'right' : prevDirection;

            return newDirection;
        });
    }, [isGameOver]);

    const checkCollision = useCallback((snake) => {
        const head = snake[0];
        if (head.x < 0 || head.x >= gameWidth || head.y < 0 || head.y >= gameHeight) {
            return true;
        }
        for (let i = 1; i < snake.length; i++) {
            if (head.x === snake[i].x && head.y === snake[i].y) {
                return true;
            }
        }
        return false;
    }, [gameWidth, gameHeight]);

    const drawGame = useCallback((snake) => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, gameWidth, gameHeight);

        snake.forEach(part => {
            ctx.fillStyle = 'green';
            ctx.fillRect(part.x, part.y, SPACE_SIZE, SPACE_SIZE);
        });

        ctx.fillStyle = 'red';
        ctx.fillRect(food.x, food.y, SPACE_SIZE, SPACE_SIZE);
    }, [gameWidth, gameHeight, food]);

    const gameOver = useCallback(() => {
        setIsGameOver(true);
        clearInterval(gameInterval);

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, gameWidth, gameHeight);
        ctx.fillStyle = 'red';
        ctx.font = '40px Helvetica';
        ctx.textAlign = 'center';
        ctx.fillText('Game Over', gameWidth / 2, gameHeight / 2);

        document.getElementById('retry-button').style.display = 'block';
    }, [gameWidth, gameHeight, gameInterval]);

    return (
        <div id="game-container" style={{ position: 'relative', backgroundColor: 'black', width: '100vw', height: '100vh' }}>
            <canvas id="game-canvas" ref={canvasRef} width={gameWidth} height={gameHeight} style={{ display: 'block', margin: '0 auto', backgroundColor: 'black' }}></canvas>
            <div id="score" style={{ position: 'absolute', top: '10px', left: '10px', fontSize: '24px', color: 'white' }}>
                Score: {score}
            </div>
            <button
                id="retry-button"
                style={{ display: isGameOver ? 'block' : 'none', position: 'absolute', left: '50%', top: '60%', transform: 'translate(-50%, -50%)', fontSize: '20px', backgroundColor: 'black', color: 'red', border: 'none', cursor: 'pointer' }}
                onClick={startGame}
            >
                ⟳ Retry
            </button>
        </div>
    );
}
