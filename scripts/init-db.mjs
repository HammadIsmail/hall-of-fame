import { Pool } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';
import dns from 'node:dns';

try {
  dns.setDefaultResultOrder('ipv4first');
} catch (e) {}

const connectionString =
  process.env.DATABASE_URI ||
  process.env.DATABASE_URL ||
  'postgresql://neondb_owner:npg_zMBgtmeR36Jy@ep-rapid-river-b4ihhko3-pooler.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require';

const pool = new Pool({ connectionString });

async function init() {
  console.log('Connecting to Neon database...');
  const client = await pool.connect();

  try {
    console.log('Creating tables...');

    // 1. Wings table
    await client.query(`
      CREATE TABLE IF NOT EXISTS wings (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        slug VARCHAR(100) UNIQUE NOT NULL,
        blurb TEXT NOT NULL,
        icon_path TEXT NOT NULL,
        display_order INT DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // 2. Curators table
    await client.query(`
      CREATE TABLE IF NOT EXISTS curators (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255) DEFAULT 'Curator',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // 3. Plaques table
    await client.query(`
      CREATE TABLE IF NOT EXISTS plaques (
        id SERIAL PRIMARY KEY,
        reference_id VARCHAR(30) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        initials VARCHAR(10) NOT NULL,
        dept_batch VARCHAR(255) NOT NULL,
        title TEXT NOT NULL,
        wing_id VARCHAR(50) REFERENCES wings(id) ON DELETE SET NULL,
        wing_name VARCHAR(100) NOT NULL,
        tier VARCHAR(50) NOT NULL,
        year VARCHAR(10) NOT NULL,
        story TEXT,
        photo_url TEXT,
        proof_url TEXT,
        submitter_name VARCHAR(255),
        submitter_contact VARCHAR(255),
        status VARCHAR(50) DEFAULT 'pending',
        rejection_note TEXT,
        approved_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    console.log('Tables verified.');

    // Seed default wings
    const wingsData = [
      {
        id: 'academics',
        name: 'Academics',
        slug: 'academics',
        blurb: 'Top results, scholarships and academic honours.',
        icon_path: 'M3 9l9-5 9 5-9 5-9-5z M7 11.5V16c0 1.4 2.2 3 5 3s5-1.6 5-3v-4.5',
        display_order: 1,
      },
      {
        id: 'competitions',
        name: 'Competitions',
        slug: 'competitions',
        blurb: 'Hackathons, contests and championships.',
        icon_path: 'M8 4h8v5a4 4 0 0 1-8 0V4z M8 6H5v1a3 3 0 0 0 3 3 M16 6h3v1a3 3 0 0 1-3 3 M12 13v4 M9 20h6',
        display_order: 2,
      },
      {
        id: 'research',
        name: 'Research & Innovation',
        slug: 'research-and-innovation',
        blurb: 'Papers, patents and things built from scratch.',
        icon_path: 'M10 3h4 M11 3v6l-6 10a1.5 1.5 0 0 0 1.3 2h11.4a1.5 1.5 0 0 0 1.3-2l-6-10V3',
        display_order: 3,
      },
      {
        id: 'sports',
        name: 'Sports',
        slug: 'sports',
        blurb: 'Medals, records and team victories.',
        icon_path: 'M12 14a5 5 0 1 0 0-10 5 5 0 0 0 0 10z M9 13.5L7 21l5-3 5 3-2-7.5',
        display_order: 4,
      },
      {
        id: 'arts',
        name: 'Arts & Culture',
        slug: 'arts-and-culture',
        blurb: 'Film, music, writing, debate and design.',
        icon_path: 'M12 3a9 9 0 1 0 0 18c1.4 0 2-.9 2-2 0-1.2-.8-1.6-.8-2.6 0-.9.7-1.4 1.8-1.4H18a3 3 0 0 0 3-3c0-5-4-9-9-9z',
        display_order: 5,
      },
      {
        id: 'community',
        name: 'Community Service',
        slug: 'community-service',
        blurb: 'Drives, volunteering and giving back.',
        icon_path: 'M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z',
        display_order: 6,
      },
    ];

    for (const w of wingsData) {
      await client.query(
        `INSERT INTO wings (id, name, slug, blurb, icon_path, display_order)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (id) DO UPDATE SET
           name = EXCLUDED.name,
           slug = EXCLUDED.slug,
           blurb = EXCLUDED.blurb,
           icon_path = EXCLUDED.icon_path,
           display_order = EXCLUDED.display_order;`,
        [w.id, w.name, w.slug, w.blurb, w.icon_path, w.display_order]
      );
    }
    console.log('Wings seeded.');

    // Seed default Curator
    const curatorEmail = 'curator@example.com';
    const curatorPass = 'curator123';
    const salt = await bcrypt.genSalt(10);
    const passHash = await bcrypt.hash(curatorPass, salt);

    await client.query(
      `INSERT INTO curators (email, password_hash, name)
       VALUES ($1, $2, $3)
       ON CONFLICT (email) DO UPDATE SET
         password_hash = EXCLUDED.password_hash,
         name = EXCLUDED.name;`,
      [curatorEmail, passHash, 'Chief Curator']
    );

    // Also add curator@uet.edu.pk as alias
    await client.query(
      `INSERT INTO curators (email, password_hash, name)
       VALUES ($1, $2, $3)
       ON CONFLICT (email) DO UPDATE SET
         password_hash = EXCLUDED.password_hash,
         name = EXCLUDED.name;`,
      ['curator@uet.edu.pk', passHash, 'UET Curator']
    );
    console.log('Curator accounts ready.');

    // Check if plaques already exist
    const { rows: existingPlaques } = await client.query('SELECT COUNT(*) FROM plaques');
    if (parseInt(existingPlaques[0].count, 10) === 0) {
      console.log('Seeding initial plaques from designs...');

      const samplePlaques = [
        {
          reference_id: 'NOM-AK2026',
          name: 'Ayesha Khan',
          initials: 'AK',
          dept_batch: 'Computer Science · 2023',
          title: '1st position, Inter-University Software Competition',
          wing_id: 'competitions',
          wing_name: 'Competitions',
          tier: 'National',
          year: '2026',
          story: 'Ayesha led our campus team in a fierce national hackathon against 40 leading universities across Pakistan, securing first place with an AI-driven disaster relief management system.',
          proof_url: 'https://news.uet.edu.pk/software-competition-winners',
          status: 'approved',
          approved_at: new Date('2026-03-15T10:00:00Z'),
        },
        {
          reference_id: 'NOM-HA2025',
          name: 'Hamza Ali',
          initials: 'HA',
          dept_batch: 'Electrical Engineering · 2022',
          title: 'Paper accepted at an international conference',
          wing_id: 'research',
          wing_name: 'Research & Innovation',
          tier: 'International',
          year: '2025',
          story: 'Hamza published a peer-reviewed research paper on high-efficiency microgrids in IEEE Transactions, presenting the campus work in Singapore.',
          proof_url: 'https://ieeexplore.ieee.org',
          status: 'approved',
          approved_at: new Date('2025-11-20T14:30:00Z'),
        },
        {
          reference_id: 'NOM-SR2026',
          name: 'Sana Rauf',
          initials: 'SR',
          dept_batch: 'Mechanical Engineering · 2024',
          title: 'Gold medal, Inter-Campus Athletics Meet',
          wing_id: 'sports',
          wing_name: 'Sports',
          tier: 'Campus',
          year: '2026',
          story: 'Sana broke the all-time 400m campus sprint record, bagging gold and leading the campus team to the overall championship trophy.',
          proof_url: 'https://sports.uet.edu.pk',
          status: 'approved',
          approved_at: new Date('2026-02-10T12:00:00Z'),
        },
        {
          reference_id: 'NOM-ZM2026',
          name: 'Zainab Malik',
          initials: 'ZM',
          dept_batch: 'Civil Engineering · 2023',
          title: 'Best short film, Inter-University Arts Festival',
          wing_id: 'arts',
          wing_name: 'Arts & Culture',
          tier: 'National',
          year: '2026',
          story: 'Zainab produced and directed a moving 12-minute documentary on industrial heritage in Faisalabad, awarded Best Short Film at the national arts council festival.',
          proof_url: 'https://artscouncil.org.pk/awards',
          status: 'approved',
          approved_at: new Date('2026-01-25T16:00:00Z'),
        },
        {
          reference_id: 'NOM-BA2026',
          name: 'Bilal Ahmad',
          initials: 'BA',
          dept_batch: 'Computer Science · 2024',
          title: 'Winner, 24-hour national hackathon',
          wing_id: 'competitions',
          wing_name: 'Competitions',
          tier: 'National',
          year: '2026',
          story: 'Bilal built an autonomous drone inspection prototype overnight, captivating the jury and clinching the grand national award.',
          proof_url: 'https://techhack.pk/results',
          status: 'approved',
          approved_at: new Date('2026-02-18T09:00:00Z'),
        },
        {
          reference_id: 'NOM-MS2025',
          name: 'Maryam Siddiqui',
          initials: 'MS',
          dept_batch: 'Computer Science · 2022',
          title: 'Represented Pakistan at an international programming contest',
          wing_id: 'competitions',
          wing_name: 'Competitions',
          tier: 'International',
          year: '2025',
          story: 'Maryam qualified in top regional trials and flew to Egypt to represent Pakistan at the World Collegiate Programming Championship.',
          proof_url: 'https://icpc.global',
          status: 'approved',
          approved_at: new Date('2025-10-12T11:00:00Z'),
        },
        {
          reference_id: 'NOM-TN2025',
          name: 'Talha Nadeem',
          initials: 'TN',
          dept_batch: 'Mechatronics & Control · 2023',
          title: 'Runner-up, campus robotics challenge',
          wing_id: 'competitions',
          wing_name: 'Competitions',
          tier: 'Campus',
          year: '2025',
          story: 'Talha designed an automated maze navigation bot using computer vision, taking second place amidst fierce competition.',
          proof_url: 'https://uet.edu.pk/robotics',
          status: 'approved',
          approved_at: new Date('2025-05-14T15:00:00Z'),
        },
        {
          reference_id: 'NOM-HJ2025',
          name: 'Hira Javed',
          initials: 'HJ',
          dept_batch: 'Software Engineering · 2023',
          title: 'Best project award, inter-university tech expo',
          wing_id: 'competitions',
          wing_name: 'Competitions',
          tier: 'National',
          year: '2025',
          story: 'Hira showcased a smart healthcare diagnostic app and received top honours from the Federal Ministry of IT.',
          proof_url: 'https://moitt.gov.pk',
          status: 'approved',
          approved_at: new Date('2025-09-08T13:00:00Z'),
        },
        {
          reference_id: 'NOM-DS2024',
          name: 'Daniyal Shah',
          initials: 'DS',
          dept_batch: 'Computer Science · 2021',
          title: '1st place, campus coding sprint',
          wing_id: 'competitions',
          wing_name: 'Competitions',
          tier: 'Campus',
          year: '2024',
          story: 'Daniyal solved 8 competitive programming questions in record time during the annual departmental speed programming contest.',
          proof_url: 'https://cs.uet.edu.pk/sprint',
          status: 'approved',
          approved_at: new Date('2024-11-04T17:00:00Z'),
        },
        // Pending queue nominations for Curator review
        {
          reference_id: 'NOM-UT2026',
          name: 'Usman Tariq',
          initials: 'UT',
          dept_batch: 'Textile Engineering · 2024',
          title: 'Gold medal, inter-campus cricket tournament',
          wing_id: 'sports',
          wing_name: 'Sports',
          tier: 'Campus',
          year: '2026',
          story: 'Usman captained the Faisalabad campus cricket team, scoring 84 runs not out in the final match to lift the championship shield.',
          proof_url: 'https://sports.uet.edu.pk/cricket-2026',
          submitter_name: 'Fahad Mehmood',
          submitter_contact: 'fahad@gmail.com',
          status: 'pending',
        },
        {
          reference_id: 'NOM-NF2026',
          name: 'Noor Fatima',
          initials: 'NF',
          dept_batch: 'Chemical Engineering · 2023',
          title: 'Led a blood donation drive on campus',
          wing_id: 'community',
          wing_name: 'Community Service',
          tier: 'Campus',
          year: '2026',
          story: 'Noor organized the annual Red Crescent blood camp mobilizing 350+ student and faculty donors in a single day.',
          proof_url: 'https://uet.edu.pk/community/blood-drive',
          submitter_name: 'Kashif Ali',
          submitter_contact: 'kashif@uet.edu.pk',
          status: 'pending',
        },
        {
          reference_id: 'NOM-IR2025',
          name: 'Ibrahim Raza',
          initials: 'IR',
          dept_batch: 'Electrical Engineering · 2022',
          title: 'Published a journal paper with faculty',
          wing_id: 'research',
          wing_name: 'Research & Innovation',
          tier: 'National',
          year: '2025',
          story: 'Co-authored a groundbreaking paper on solar cell degradation patterns published in the Pakistan Journal of Applied Physics.',
          proof_url: 'https://pjap.org/paper-128',
          submitter_name: 'Dr. Munir',
          submitter_contact: 'dr.munir@uet.edu.pk',
          status: 'pending',
        },
        {
          reference_id: 'NOM-LA2026',
          name: 'Laiba Anwar',
          initials: 'LA',
          dept_batch: 'Civil Engineering · 2025',
          title: 'Winner, inter-university debate championship',
          wing_id: 'arts',
          wing_name: 'Arts & Culture',
          tier: 'National',
          year: '2026',
          story: 'Best English speaker at the All Pakistan Parliamentary Debates, bringing the prestigious Urdu & English trophy to our campus.',
          proof_url: 'https://debates.pk/championship-2026',
          submitter_name: 'Debating Society President',
          submitter_contact: 'debates@uet.edu.pk',
          status: 'pending',
        },
      ];

      for (const p of samplePlaques) {
        await client.query(
          `INSERT INTO plaques (
            reference_id, name, initials, dept_batch, title, wing_id, wing_name,
            tier, year, story, proof_url, submitter_name, submitter_contact,
            status, approved_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
          ON CONFLICT (reference_id) DO NOTHING;`,
          [
            p.reference_id,
            p.name,
            p.initials,
            p.dept_batch,
            p.title,
            p.wing_id,
            p.wing_name,
            p.tier,
            p.year,
            p.story,
            p.proof_url,
            p.submitter_name || null,
            p.submitter_contact || null,
            p.status,
            p.approved_at || null,
          ]
        );
      }
      console.log('Sample plaques seeded.');
    }

    console.log('Database initialization completed successfully!');
  } finally {
    client.release();
    await pool.end();
  }
}

init().catch(err => {
  console.error('Database initialization error:', err);
  process.exit(1);
});

