const path = require('path');
require('dotenv').config({path: path.resolve(__dirname, '../../.env')});

const request = require('supertest');
const app = require('../app');
const { mongoConnect, mongoDisconnect } = require('../services/mongo.js');
const { loadPlanetsData } = require('../models/planets.model');

describe('Launch API', () => {
    beforeAll(async ()=> {
        await mongoConnect();
        await loadPlanetsData();    
    });
    afterAll(async ()=>{
        await mongoDisconnect();  
    });

    describe('Test GET/launches', () => {
        test('it should respond with 200 success', async () => {
            await request(app)
                .get('/v1/launches')
                .expect('Content-Type', /json/)
                .expect(200); 
        })
    });

    describe('Test POST/launches', () => {
        const completeLaunchData = {
            mission: 'Asus Enterprise',
            rocket: 'NCC 1725-C',
            target: 'Kepler-62 f',
            launchDate: 'May 5, 2027'
        }
        const launchDataWithoutDate = {
            mission: 'Asus Enterprise',
            rocket: 'NCC 1725-C',
            target: 'Kepler-62 f',
        }
        const launchDataWithInvalidDate = {
            mission: 'Asus Enterprise',
            rocket: 'NCC 1725-C',
            target: 'Kepler-62 f',
            launchDate: 'zzzz'
        }

        test('it should respond with 201 success', async () => {
            const response = await request(app)
                .post('/v1/launches')
                .send(completeLaunchData)
                .expect('Content-Type', /json/)
                .expect(201)
            
            const requestDate = new Date(completeLaunchData.launchDate).valueOf();
            const responseDate = new Date(response.body.launchDate).valueOf();
            expect(responseDate).toBe(requestDate);
            
            expect(response.body).toMatchObject(launchDataWithoutDate)
        })

        test('It should catch missing required properties', async () => {
            const response = await request(app)
                .post('/v1/launches')
                .send(launchDataWithoutDate)
                .expect('Content-Type', /json/)
                .expect(400)
        
            expect(response.body).toStrictEqual({
                error: 'Missing required launch property'
            })
        })

        test('It should catch invalid dates',async () => {
            const response = await request(app)
                .post('/v1/launches')
                .send(launchDataWithInvalidDate)
                .expect('Content-Type', /json/)
                .expect(400)

            expect(response.body).toStrictEqual({
                error: 'Invalid launch Date'
            })
        })
    })  
});