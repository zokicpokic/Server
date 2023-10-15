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

//APIS
// GET all jobs
app.get('/api/jobs', async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool
      .request()
      .query('SELECT * FROM jobs');
    res.json(result.recordset);
    pool.close();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET a single job by ID
app.get('/api/jobs/:id', async (req, res) => {
  const jobId = req.params.id;
  try {
    const pool = await sql.connect(config);
    const result = await pool
      .request()
      .input('id', sql.UniqueIdentifier, jobId)
      .query('SELECT * FROM jobs WHERE id = @id');
    if (result.recordset.length === 0) {
      res.status(404).send('Job not found');
    } else {
      res.json(result.recordset[0]);
    }
    pool.close();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST a new job
app.post('/api/jobs', async (req, res) => {
  const newJob = req.body; // Assuming you send job data in the request body
  try {
    const pool = await sql.connect(config);
    const result = await pool
      .request()
      .input('job_type_id', sql.UniqueIdentifier, newJob.job_type_id)
      .input('client_id', sql.UniqueIdentifier, newJob.client_id)
      // Add more inputs for other columns as needed
      .query(`
        INSERT INTO jobs (job_type_id, client_id, job_date, ...)
        VALUES (@job_type_id, @client_id, GETDATE(), ...);
      `);
    res.status(201).json({ message: 'Job created successfully' });
    pool.close();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT (update) an existing job by ID
app.put('/api/jobs/:id', async (req, res) => {
  const jobId = req.params.id;
  const updatedJob = req.body; // Assuming you send updated job data in the request body
  try {
    const pool = await sql.connect(config);
    const result = await pool
      .request()
      .input('job_id', sql.UniqueIdentifier, jobId)
      .input('job_type_id', sql.UniqueIdentifier, updatedJob.job_type_id)
      .input('client_id', sql.UniqueIdentifier, updatedJob.client_id)
      // Add more inputs for other columns as needed
      .query(`
        UPDATE jobs
        SET job_type_id = @job_type_id, client_id = @client_id, ...
        WHERE id = @job_id;
      `);
    res.json({ message: 'Job updated successfully' });
    pool.close();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE a job by ID
app.delete('/api/jobs/:id', async (req, res) => {
  const jobId = req.params.id;
  try {
    const pool = await sql.connect(config);
    const result = await pool
      .request()
      .input('id', sql.UniqueIdentifier, jobId)
      .query('DELETE FROM jobs WHERE id = @id');
    res.json({ message: 'Job deleted successfully' });
    pool.close();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET all job types
app.get('/api/job_types', async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool
      .request()
      .query('SELECT * FROM job_type');
    res.json(result.recordset);
    pool.close();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET all materials and equipment
app.get('/api/materials_equipment', async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool
      .request()
      .query('SELECT * FROM materials_equipment');
    res.json(result.recordset);
    pool.close();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET all users
app.get('/api/users', async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool
      .request()
      .query('SELECT * FROM users');
    res.json(result.recordset);
    pool.close();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET all statuses
app.get('/api/statuses', async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool
      .request()
      .query('SELECT * FROM status');
    res.json(result.recordset);
    pool.close();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET all clients
app.get('/api/clients', async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool
      .request()
      .query('SELECT * FROM clients');
    res.json(result.recordset);
    pool.close();
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
