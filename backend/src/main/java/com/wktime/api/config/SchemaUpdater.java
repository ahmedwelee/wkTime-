package com.wktime.api.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.dao.DataAccessException;

@Component
public class  SchemaUpdater implements CommandLineRunner {
    private final JdbcTemplate jdbc;

    public SchemaUpdater(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @Override
    public void run(String... args) {
        try {
            // Try to add the published column if it's missing. Some H2 versions support
            // "ADD COLUMN IF NOT EXISTS", but we attempt the simple ALTER and ignore
            // errors if the column already exists.
            jdbc.execute("ALTER TABLE shifts ADD COLUMN published BOOLEAN DEFAULT FALSE");
        } catch (DataAccessException ex) {
            // Column likely already exists or DB doesn't allow ALTER; ignore in that case
            System.out.println("SchemaUpdater: published column present or could not be added: " + ex.getMessage());
        }

        try {
            // Ensure 'status' column exists (string representation of ShiftStatus enum)
            jdbc.execute("ALTER TABLE shifts ADD COLUMN status VARCHAR(32) DEFAULT 'ASSIGNED'");
        } catch (DataAccessException ex) {
            System.out.println("SchemaUpdater: status column present or could not be added: " + ex.getMessage());
        }
    }
}

