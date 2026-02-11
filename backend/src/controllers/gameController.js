import Game from '../models/Game.js';
import config from '../config/index.js';
import { successResponse, errorResponse } from '../utils/response.js';

export const getGameConfig = async (req, res) => {
  try {
    return successResponse(res, {
      config: config.game,
    });
  } catch (error) {
    console.error('Get game config error:', error);
    return errorResponse(res, 'Failed to get game config', 500);
  }
};

export const createGame = async (req, res) => {
  try {
    const { opponentId, isAI = false, aiDifficulty = 'medium', mode, difficulty } = req.body;

    // Support both old (isAI) and new (mode) API formats
    const isAIGame = mode === 'ai' || isAI === true;
    const finalDifficulty = difficulty || aiDifficulty || 'medium';

    if (!isAIGame && !opponentId) {
      return errorResponse(res, 'Opponent ID is required for PvP games', 400);
    }

    if (isAIGame && !['easy', 'medium', 'hard'].includes(finalDifficulty)) {
      return errorResponse(res, 'Invalid AI difficulty', 400);
    }

    const game = await Game.create(
      req.user.id,
      opponentId ? parseInt(opponentId) : null,
      isAIGame,
      isAIGame ? finalDifficulty : null
    );

    return successResponse(res, { game }, 'Game created', 201);
  } catch (error) {
    console.error('Create game error:', error);
    return errorResponse(res, 'Failed to create game', 500);
  }
};

export const getGame = async (req, res) => {
  try {
    const { gameId } = req.params;
    const game = await Game.findById(parseInt(gameId));

    if (!game) {
      return errorResponse(res, 'Game not found', 404);
    }

    // Allow access if user is a participant or if it's a completed game (for viewing history)
    const userId = req.user.id;
    const isParticipant = game.player1_id === userId || game.player2_id === userId;
    const isCompleted = game.status === 'completed';
    
    if (!isParticipant && !isCompleted) {
      return errorResponse(res, 'Not authorized to view this game', 403);
    }

    return successResponse(res, { game });
  } catch (error) {
    console.error('Get game error:', error);
    return errorResponse(res, 'Failed to get game', 500);
  }
};

export const startGame = async (req, res) => {
  try {
    const { gameId } = req.params;
    const game = await Game.findById(parseInt(gameId));
    
    if (!game) {
      return errorResponse(res, 'Game not found', 404);
    }

    // Only allow player1 (game creator) to start the game
    if (game.player1_id !== req.user.id) {
      return errorResponse(res, 'Only the game creator can start the game', 403);
    }

    const startedGame = await Game.startGame(parseInt(gameId));
    return successResponse(res, { game: startedGame }, 'Game started');
  } catch (error) {
    console.error('Start game error:', error);
    return errorResponse(res, 'Failed to start game', 500);
  }
};

export const updateScore = async (req, res) => {
  try {
    const { gameId } = req.params;
    const { player1Score, player2Score } = req.body;

    if (player1Score === undefined || player2Score === undefined) {
      return errorResponse(res, 'Both player scores are required', 400);
    }

    const game = await Game.findById(parseInt(gameId));
    if (!game) {
      return errorResponse(res, 'Game not found', 404);
    }

    // Only participants can update score
    const userId = req.user.id;
    if (game.player1_id !== userId && game.player2_id !== userId) {
      return errorResponse(res, 'Not authorized to update this game', 403);
    }

    const updatedGame = await Game.updateScore(
      parseInt(gameId),
      parseInt(player1Score),
      parseInt(player2Score)
    );

    return successResponse(res, { game: updatedGame }, 'Score updated');
  } catch (error) {
    console.error('Update score error:', error);
    return errorResponse(res, 'Failed to update score', 500);
  }
};

export const endGame = async (req, res) => {
  try {
    const { gameId } = req.params;
    const { winnerId } = req.body;

    if (!winnerId) {
      return errorResponse(res, 'Winner ID is required', 400);
    }

    const game = await Game.findById(parseInt(gameId));
    if (!game) {
      return errorResponse(res, 'Game not found', 404);
    }

    // Only participants can end the game
    const userId = req.user.id;
    if (game.player1_id !== userId && game.player2_id !== userId) {
      return errorResponse(res, 'Not authorized to end this game', 403);
    }

    // Winner must be a valid participant (or null for AI games where AI wins)
    const winnerIdInt = parseInt(winnerId);
    const validWinner = winnerIdInt === game.player1_id || 
                        winnerIdInt === game.player2_id ||
                        (game.is_ai_game && winnerIdInt === 0); // 0 represents AI winner
    
    if (!validWinner) {
      return errorResponse(res, 'Winner must be a game participant', 400);
    }

    const endedGame = await Game.endGame(parseInt(gameId), winnerIdInt === 0 ? null : winnerIdInt);

    return successResponse(res, { game: endedGame }, 'Game ended');
  } catch (error) {
    console.error('End game error:', error);
    return errorResponse(res, 'Failed to end game', 500);
  }
};

export const getMatchHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 20, offset = 0 } = req.query;

    const targetUserId = userId ? parseInt(userId) : req.user.id;

    const games = await Game.getUserGames(
      targetUserId,
      parseInt(limit),
      parseInt(offset)
    );

    return successResponse(res, { games, count: games.length });
  } catch (error) {
    console.error('Get match history error:', error);
    return errorResponse(res, 'Failed to get match history', 500);
  }
};

export const getLeaderboard = async (req, res) => {
  try {
    const { limit = 100 } = req.query;
    const leaderboard = await Game.getLeaderboard(parseInt(limit));

    return successResponse(res, { leaderboard, count: leaderboard.length });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    return errorResponse(res, 'Failed to get leaderboard', 500);
  }
};

export const abandonGame = async (req, res) => {
  try {
    const { gameId } = req.params;
    const game = await Game.abandonGame(parseInt(gameId));

    return successResponse(res, { game }, 'Game abandoned');
  } catch (error) {
    console.error('Abandon game error:', error);
    return errorResponse(res, 'Failed to abandon game', 500);
  }
};

export const getActiveGames = async (req, res) => {
  try {
    const games = await Game.getActiveGames();
    return successResponse(res, { games, count: games.length });
  } catch (error) {
    console.error('Get active games error:', error);
    return errorResponse(res, 'Failed to get active games', 500);
  }
};

export default {
  getGameConfig,
  createGame,
  getGame,
  startGame,
  updateScore,
  endGame,
  getMatchHistory,
  getLeaderboard,
  abandonGame,
  getActiveGames,
};
