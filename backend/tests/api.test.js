const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const User = require('../models/User');
const Asset = require('../models/Asset');

// Mock data
const testUser = {
  name: 'Test User',
  email: 'test@example.com',
  password: 'password123',
  role: 'user'
};

const testAssetOwner = {
  name: 'Asset Owner',
  email: 'owner@example.com',
  password: 'password123',
  role: 'asset-owner'
};

const testAsset = {
  title: 'Test Property',
  description: 'A test property for API testing',
  assetType: 'real-estate',
  location: 'Mumbai, India',
  totalValue: 10000000,
  currency: 'INR',
  tokenSymbol: 'TPROP',
  totalTokens: 1000,
  tokenPrice: 10000,
  minInvestment: 50000,
  expectedYield: 8,
  status: 'active'
};

let userToken, ownerToken, assetId;

// Connect to test database before tests
beforeAll(async () => {
  const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/rwabridge-test';
  await mongoose.connect(MONGO_URI);
  
  // Clear test database
  await User.deleteMany({});
  await Asset.deleteMany({});
});

// Disconnect after tests
afterAll(async () => {
  await mongoose.connection.close();
});

describe('Authentication API', () => {
  test('Should register a new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser);
    
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.user).toHaveProperty('id');
    expect(res.body.user.name).toBe(testUser.name);
    expect(res.body.user.email).toBe(testUser.email);
    expect(res.body.token).toBeDefined();
    
    userToken = res.body.token;
  });
  
  test('Should register an asset owner', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(testAssetOwner);
    
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.user.role).toBe('asset-owner');
    
    ownerToken = res.body.token;
  });
  
  test('Should login a user', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password
      });
    
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
  });
  
  test('Should get current user profile', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${userToken}`);
    
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user.email).toBe(testUser.email);
  });
});

describe('Asset API', () => {
  test('Should create a new asset', async () => {
    const res = await request(app)
      .post('/api/assets')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send(testAsset);
    
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.asset).toHaveProperty('_id');
    expect(res.body.asset.title).toBe(testAsset.title);
    
    assetId = res.body.asset._id;
  });
  
  test('Should get all assets', async () => {
    const res = await request(app)
      .get('/api/assets');
    
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.assets).toBeInstanceOf(Array);
    expect(res.body.assets.length).toBeGreaterThan(0);
  });
  
  test('Should get a single asset', async () => {
    const res = await request(app)
      .get(`/api/assets/${assetId}`);
    
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.asset._id).toBe(assetId);
  });
  
  test('Should update an asset', async () => {
    const res = await request(app)
      .patch(`/api/assets/${assetId}`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({
        description: 'Updated description'
      });
    
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.asset.description).toBe('Updated description');
  });
  
  test('Should get user assets', async () => {
    const res = await request(app)
      .get('/api/assets/user/assets')
      .set('Authorization', `Bearer ${ownerToken}`);
    
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.assets).toBeInstanceOf(Array);
    expect(res.body.assets.length).toBeGreaterThan(0);
  });
});

describe('Investment API', () => {
  test('Should invest in an asset', async () => {
    const res = await request(app)
      .post(`/api/assets/${assetId}/invest`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        tokensAmount: 5,
        investmentAmount: 50000
      });
    
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('Investment successful');
  });
  
  test('Should get user investments', async () => {
    const res = await request(app)
      .get('/api/assets/user/investments')
      .set('Authorization', `Bearer ${userToken}`);
    
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.assets).toBeInstanceOf(Array);
    expect(res.body.assets.length).toBeGreaterThan(0);
  });
});

describe('Simulation API', () => {
  test('Should simulate a transaction', async () => {
    const res = await request(app)
      .post('/api/simulation/simulate-transaction')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        assetId,
        tokenAmount: 10,
        transactionType: 'buy'
      });
    
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.transaction).toHaveProperty('transactionHash');
  });
  
  test('Should get wallet balance', async () => {
    const res = await request(app)
      .get('/api/simulation/wallet-balance')
      .set('Authorization', `Bearer ${userToken}`);
    
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.balance).toHaveProperty('sol');
    expect(res.body.balance).toHaveProperty('usdc');
  });
  
  test('Should simulate tokenization', async () => {
    const res = await request(app)
      .post(`/api/simulation/tokenize/${assetId}`)
      .set('Authorization', `Bearer ${ownerToken}`);
    
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.tokenization).toHaveProperty('contractAddress');
  });
  
  test('Should get transaction history', async () => {
    const res = await request(app)
      .get('/api/simulation/transaction-history')
      .set('Authorization', `Bearer ${userToken}`);
    
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.transactions).toBeInstanceOf(Array);
  });
});
