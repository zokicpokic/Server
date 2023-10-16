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
const MAX = 8000;
// POST a new job
app.post('/api/jobs', async (req, res) => {
  const newJob = req.body; // Assuming you send job data in the request body
  try {
    const pool = await sql.connect(config);
    const result = await pool
      .request()
      .input('client_id', sql.UniqueIdentifier, newJob.client_id)
      .input('operater_id', sql.UniqueIdentifier, newJob.operater_id)
      .input('job_date', sql.DateTime, newJob.job_date)
      .input('job_type_id', sql.UniqueIdentifier, newJob.job_type_id)
      .input('paper_id', sql.UniqueIdentifier, newJob.paper_id)
      .input('printer_id', sql.UniqueIdentifier, newJob.printer_id)
      .input('envelope_id', sql.UniqueIdentifier, newJob.envelope_id)
      .input('envelope_printer_id', sql.UniqueIdentifier, newJob.envelope_printer_id)
      .input('envelope_ps_id', sql.UniqueIdentifier, newJob.envelope_ps_id)
      .input('ps_machine_id', sql.UniqueIdentifier, newJob.ps_machine_id)
      .input('qty_lists', sql.Int, newJob.qty_lists)
      .input('qty_pages', sql.Int, newJob.qty_pages)
      .input('qty_envelope', sql.Int, newJob.qty_envelope)
      .input('qty_boxes', sql.Int, newJob.qty_boxes)
      .input('start_time', sql.NVarChar(8), newJob.start_time)
      .input('end_time', sql.NVarChar(8), newJob.end_time)
      .input('status_id', sql.UniqueIdentifier, newJob.status_id)
      .input('other', sql.NVarChar(MAX), newJob.other)
      // Add inputs for other columns as needed
      .query(`
        INSERT INTO jobs (
          client_id,
          operater_id,
          job_date,
          job_type_id,
          paper_id,
          printer_id,
          envelope_id,
          envelope_printer_id,
          envelope_ps_id,
          ps_machine_id,
          qty_lists,
          qty_pages,
          qty_envelope,
          qty_boxes,
          start_time,
          end_time,
          status_id,
          other
          -- Add other column names here
        )
        VALUES (
          @client_id,
          @operater_id,
          @job_date,
          @job_type_id,
          @paper_id,
          @printer_id,
          @envelope_id,
          @envelope_printer_id,
          @envelope_ps_id,
          @ps_machine_id,
          @qty_lists,
          @qty_pages,
          @qty_envelope,
          @qty_boxes,
          @start_time,
          @end_time,
          @status_id,
          @other
          -- Add values for other columns here
        );
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
