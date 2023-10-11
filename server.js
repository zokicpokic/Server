const express = require('express');
const https = require('https');
const fs = require('fs');
const cors = require('cors');
const sql = require('mssql');

// SSL configuration
let key = fs.readFileSync('../certs/2091920919.key','utf-8')
let cert = fs.readFileSync('../certs/2091920919.crt','utf-8')
//const port = 8443 do not use

const parameters = {
  key: key,
  cert: cert
}

const app = express(),
      bodyParser = require("body-parser");
      port = 3000;
app.use(cors({
  methods: ['GET','POST','DELETE','UPDATE','PUT','PATCH'],
  origin: '*'
}));

app.use(bodyParser.json());

// SQL Server configuration
const config = {
  user: 'sa',
  password: 'Q1w2e3r4t5y^',
  server: 'localhost',
  database: 'jobs_db',
  encrypt: true,
  trustServerCertificate: true,
};

app.use(bodyParser.json());

// GET - Retrieve all jobs
app.get('/jobs', async (req, res) => {
  try {
    const pool = await sql.connect(config);
    let result; // Define the result variable here

    result = await pool
      .request()
      .query(`
        SELECT
          jobs.*,
          codes.code_name AS Prn1_name,
          codes2.code_name AS Prn2_name,
          codes3.code_name AS Prn3_name,
          codes4.code_name AS Prn4_name,
          codes5.code_name AS Prn5_name,
          codes6.code_name AS Kov1_name,
          codes7.code_name AS Kov2_name,
          codes8.code_name AS Kov3_name,
          codes9.code_name AS Kov4_name,
          materials.material_name,
          status.status_name
        FROM jobs
        LEFT JOIN codes ON jobs.Prn1 = codes.id
        LEFT JOIN codes AS codes2 ON jobs.Prn2 = codes2.id
        LEFT JOIN codes AS codes3 ON jobs.Prn3 = codes3.id
        LEFT JOIN codes AS codes4 ON jobs.Prn4 = codes4.id
        LEFT JOIN codes AS codes5 ON jobs.Prn5 = codes5.id
        LEFT JOIN codes AS codes6 ON jobs.Kov1 = codes6.id
        LEFT JOIN codes AS codes7 ON jobs.Kov2 = codes7.id
        LEFT JOIN codes AS codes8 ON jobs.Kov3 = codes8.id
        LEFT JOIN codes AS codes9 ON jobs.Kov4 = codes9.id
        LEFT JOIN materials ON jobs.materialid = materials.id
        LEFT JOIN status ON jobs.statusid = status.id
      `);

    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// Add these routes to your Node.js server

// GET - Retrieve all PRN codes
app.get('/codes', async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request().query('SELECT id, code_name FROM codes');
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET - Retrieve all materials
app.get('/materials', async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request().query('SELECT id, material_name FROM materials');
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET - Retrieve all status values
app.get('/statuses', async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request().query('SELECT id, status_name FROM status');
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});




// POST - Create a new job
app.post('/jobs', async (req, res) => {
  const {
    job_name,
    job_date,
    client_name,
    operater_name,
    prn1,
    prn2,
    prn3,
    prn4,
    prn5,
    kov1,
    kov2,
    kov3,
    kov4,
    material_id,
    status_id,
  } = req.body;
  try {
    const pool = await sql.connect(config);
    const result = await pool
      .request()
      .input('job_name', sql.NVarChar, job_name)
      .input('job_date', sql.DateTime, job_date)
      .input('client_name', sql.NVarChar, client_name)
      .input('operater_name', sql.NVarChar, operater_name)
      .input('prn1', sql.UniqueIdentifier, prn1)
      .input('prn2', sql.UniqueIdentifier, prn2)
      .input('prn3', sql.UniqueIdentifier, prn3)
      .input('prn4', sql.UniqueIdentifier, prn4)
      .input('prn5', sql.UniqueIdentifier, prn5)
      .input('kov1', sql.UniqueIdentifier, kov1)
      .input('kov2', sql.UniqueIdentifier, kov2)
      .input('kov3', sql.UniqueIdentifier, kov3)
      .input('kov4', sql.UniqueIdentifier, kov4)
      .input('material_id', sql.UniqueIdentifier, material_id)
      .input('status_id', sql.UniqueIdentifier, status_id)
      .query(`
        INSERT INTO jobs (
          job_name,
          job_date,
          client_name,
          operater_name,
          Prn1,
          Prn2,
          Prn3,
          Prn4,
          Prn5,
          Kov1,
          Kov2,
          Kov3,
          Kov4,
          materialid,
          statusid
        ) VALUES (
          @job_name,
          @job_date,
          @client_name,
          @operater_name,
          @prn1,
          @prn2,
          @prn3,
          @prn4,
          @prn5,
          @kov1,
          @kov2,
          @kov3,
          @kov4,
          @material_id,
          @status_id
        );

        SELECT SCOPE_IDENTITY() AS new_jobid;
      `);

    res.json({ jobid: result.recordset[0].new_jobid });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT - Update a job
app.put('/jobs/:jobid', async (req, res) => {
  const jobid = req.params.jobid;
  const {
    job_name,
    job_date,
    client_name,
    operater_name,
    prn1,
    prn2,
    prn3,
    prn4,
    prn5,
    kov1,
    kov2,
    kov3,
    kov4,
    material_id,
    status_id
  } = req.body;

  try {
    const pool = await sql.connect(config);
    await pool.request()
      .input('jobid', sql.UniqueIdentifier, jobid)
      .input('job_name', sql.NVarChar, job_name)
      .input('job_date', sql.DateTime, job_date)
      .input('client_name', sql.NVarChar, client_name)
      .input('operater_name', sql.NVarChar, operater_name)
      .input('prn1', sql.UniqueIdentifier, prn1)
      .input('prn2', sql.UniqueIdentifier, prn2)
      .input('prn3', sql.UniqueIdentifier, prn3)
      .input('prn4', sql.UniqueIdentifier, prn4)
      .input('prn5', sql.UniqueIdentifier, prn5)
      .input('kov1', sql.UniqueIdentifier, kov1)
      .input('kov2', sql.UniqueIdentifier, kov2)
      .input('kov3', sql.UniqueIdentifier, kov3)
      .input('kov4', sql.UniqueIdentifier, kov4)
      .input('material_id', sql.UniqueIdentifier, material_id)
      .input('status_id', sql.UniqueIdentifier, status_id)
      .query(`
        UPDATE jobs SET 
          job_name = @job_name, 
          job_date = @job_date, 
          client_name = @client_name, 
          operater_name = @operater_name, 
          Prn1 = @prn1, 
          Prn2 = @prn2,
          Prn3 = @prn3,
          Prn4 = @prn4,
          Prn5 = @prn5,
          Kov1 = @kov1,
          Kov2 = @kov2,
          Kov3 = @kov3,
          Kov4 = @kov4,
          materialid = @material_id,
          statusid = @status_id 
        WHERE jobid = @jobid
      `);

    res.sendStatus(200);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// DELETE - Delete a job
app.delete('/jobs/:jobid', async (req, res) => {
  const jobid = req.params.jobid;
  try {
    const pool = await sql.connect(config);
    await pool.request()
      .input('jobid', sql.UniqueIdentifier, jobid)
      .query('DELETE FROM jobs WHERE jobid = @jobid');
    res.sendStatus(200);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create HTTPS server
const httpsServer = https.createServer(parameters, app);

// Start server
let server = https.createServer(parameters,app)
server.listen(port, '0.0.0.0', () => {
    console.log(`Server listening on the port::${port}`);
});
