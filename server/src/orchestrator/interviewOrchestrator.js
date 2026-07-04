const questionAgent = require('../agents/questionAgent');
const scoringAgent = require('../agents/scoringAgent');

// Single entry point the controllers talk to — hides which agent handles what
const getNextQuestion = (params) => questionAgent.getNextQuestion(params);
const generateScorecard = (params) => scoringAgent.generateScorecard(params);

module.exports = { getNextQuestion, generateScorecard };