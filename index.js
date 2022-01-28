#!/usr/bin/env node
import chalk from "chalk";
import chalkAnimation from "chalk-animation";
import inquirer from "inquirer";
import gradient from "gradient-string";
import figlet from "figlet";
import { createSpinner } from "nanospinner";
import axios from "axios";
import 'dotenv/config'
let playerName;


const sleep = (ms = 2000) => new Promise((r) => setTimeout(r, ms));
async function welcome() {
    const rainbowTitle = chalkAnimation.rainbow(
        "Who wants to be a Billionaire? \n"
    );
    await sleep();
    rainbowTitle.stop();

    console.log(`
        ${chalk.bgBlue("HOW TO PLAY")}
        I am a process on your computer.
        If you get any question wrong I will be ${chalk.bgRed("killed")}
        So get all the questions right...
        
        `);
}

async function askName() {
    const answers = await inquirer.prompt({
        name: "player_name",
        type: "input",
        message: "What is your name?",
        default() {
            return "Player";
        },
    });
    playerName = answers.player_name;
}
const getAnswer = (answers, curOption) => {
    // const correctAns =
    let i = 0;
    const options = getOptions(curOption);
    for (const key in answers) {
        // console.log(`${answers[key]}`);
        if (answers[key] == "true") {
            return options[i];
        }
        i++;
    }
    return 1;
};

const getOptions = (options) => {
    const newOptions = [];
    for (const key in options) {
        if (options[key] != null) {
            newOptions.push(options[key]);
        }
    }
    return newOptions;
};
const getQuestions = async () => {
    // const questions = [];

    const response = await axios.get(
        `https://quizapi.io/api/v1/questions?apiKey=${process.env.API_KEY}&limit=5&category=Code&tags=JavaScript&difficulty=easy&multiple_correct_answers=false`
    );
    const initialQuestions = await response.data;
    let questions = [];
    initialQuestions.map((question) => {
        const newQuestion = {
            theQuestion: question.question,
            options: getOptions(question.answers),
            correctAnswer: getAnswer(
                question.correct_answers,
                question.answers
            ),
        };
        questions.push(newQuestion);
    });
    return await questions;
};
const Askquestion = async (question) => {
    const answers = await inquirer.prompt({
        name: "ques",
        type: "list",
        message: `${question.theQuestion}`,
        choices: question.options,
    });
    
     await handleAnswer(answers.ques == question.correctAnswer);
};

async function Askquestions() {
    const questions = await getQuestions();
    // console.log(questions);
    let i = 1;

    // questions.map( async(question) => await Askquestion(question));
    for(const question of questions){
        await Askquestion(question)
    }
}
async function handleAnswer(isCorrect) {
    // console.log(isCorrect);
    const spinner = createSpinner("Checking answer...").start();
    await sleep();

    if (isCorrect) {
        spinner.success({ text: `Nice work ${playerName}.` });
    } else {
        spinner.error({ text: `Game over, you loose ${playerName}` });
        process.exit(1);
    }
}

function winner() {
    console.clear();
    const mgs = `Congrats, ${playerName} !\n $ 1 , 0 0 0, 0 0 0 ,0 0 0,0 0 0 `;
    figlet(mgs, (err, data) => {
        console.log(gradient.pastel.multiline(data));
    });
}
await welcome();
await askName();

await Askquestions();
await winner();
