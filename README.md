# PesaDB

A lightweight relational database management system built entirely in TypeScript, running directly in the browser.

**Built for Pesapal Junior Dev Challenge '26**

## Features
**Core Database Engine**
- SQL query support (SELECT, INSERT, UPDATE, DELETE)
- JOIN operations with relational integrity
- Schema management with constraints (PRIMARY KEY, UNIQUE, NOT NULL)
- Index-based optimization for fast lookups
- Browser-native persistence with localStorage

**Interactive Interface**
- SQL REPL with query execution
- Visual table explorer for CRUD operations
- Real-time transaction ledger demo
- System architecture documentation

## Quick Start

**Prerequisites:** Node.js 16+

```bash
# Clone and navigate
git clone <your-repo-url>
cd pesadb

# Install dependencies
npm install

# Start development server
npm run dev

# Open browser
# Navigate to http://localhost:3000
```

## Usage

### SQL Examples

```sql
-- Create table
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE
)

-- Insert data
INSERT INTO users (id, name, email) 
VALUES (1, 'John Doe', 'john@example.com')

-- Query with JOIN
SELECT t.id, u.name, t.amount 
FROM transactions t
JOIN users u ON t.user_id = u.id
WHERE t.amount > 100
```

### Programmatic API

```typescript
import { PesaDB } from './rdbms/database';

// Execute queries
const result = PesaDB.query('SELECT * FROM users');

// Access results
console.log(result.rows);
```

## Architecture

```
pesadb/
├── rdbms/              # Database engine
│   ├── database.ts     # Main API
│   └── core/
│       ├── storage.ts  # Persistence layer
│       ├── parser.ts   # SQL parser
│       └── executor.ts # Query execution
├── components/         # React UI
│   ├── SQLRepl.tsx     # Query interface
│   ├── TableExplorer.tsx
│   └── DemoApp.tsx     # Transaction demo
└── types.ts            # Type definitions
```

## Implementation Highlights

**Query Processing**
- Recursive descent SQL parser
- Query plan optimization
- Index-based lookups (O(1) for primary keys)
- Efficient JOIN using hash joins

**Constraint Enforcement**
- Primary key uniqueness validation
- Unique constraint checking
- NOT NULL enforcement
- Type validation on insert/update

**Storage**
- In-memory row storage
- localStorage persistence
- Automatic index maintenance
- Schema versioning

## Tech Stack

- **TypeScript** - Type-safe implementation
- **React** - User interface
- **Vite** - Build tooling
- **Tailwind CSS** - Styling

## Development

```bash
# Run tests
npm test

# Build for production
npm run build

# Type checking
npm run type-check
```

## Design Decisions

**Browser-First Architecture**
- No backend dependency for easy deployment
- localStorage provides sufficient persistence for demo
- Client-side processing demonstrates core RDBMS concepts

**SQL Dialect**
- Subset of SQL that covers essential operations
- Focus on quality over quantity of features
- Extensible parser design for future enhancements

**Performance Trade-offs**
- Hash-based indexes for O(1) primary key lookups
- In-memory processing for fast query execution
- Trade memory for speed (appropriate for browser context)

## Limitations & Future Work

**Current Limitations**
- In-memory only (data lost on page refresh without localStorage)
- Single-user context
- Limited to browser storage quota (~5-10MB)

**Future Enhancements**
- IndexedDB for larger datasets
- Web Worker for background processing
- Advanced SQL features (GROUP BY, aggregate functions)
- Transaction rollback support
- Query result caching

## AI-Assisted Development

This project was developed with AI assistance to accelerate development and ensure best practices:

**Claude AI (Anthropic)** - Used for:
- Initial project architecture and structure
- Code review and optimization suggestions
- Documentation improvement
- Debugging complex query execution logic

All core algorithms, design decisions, and implementation details reflect my understanding of database systems. AI was used as a learning and productivity tool, similar to technical documentation or Stack Overflow.

## Resources Referenced

- Database System Concepts (Silberschatz et al.) - Index design patterns
- SQLite Documentation - SQL syntax and parsing approaches
- TypeScript Handbook - Type system best practices

## Author

**Your Name**
- GitHub: (https://github.com/zablonzekky)
- Email: ewwabwoba@gmail.com
- LinkedIn: (https://www.linkedin.com/in/ezekiel-wabwoba/?lipi=urn%3Ali%3Apage%3Ad_flagship3_feed%3BY%2FFOFcT9QqCggkcqLaTIFQ%3D%3D)

Built as part of the Pesapal Junior Developer Challenge 2026.

**Note:** PesaDB is an educational project demonstrating RDBMS concepts in a browser environment. For production use, consider established solutions like PostgreSQL, MySQL, or SQLite.