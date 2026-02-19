CREATE TABLE IF NOT EXISTS approval_history (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,

    pr_id BIGINT NOT NULL,
    approver_id BIGINT NOT NULL,

    action VARCHAR(20) NOT NULL,
    comments VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_approval_pr
        FOREIGN KEY (pr_id)
        REFERENCES purchase_requisitions(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_approval_user
        FOREIGN KEY (approver_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);
