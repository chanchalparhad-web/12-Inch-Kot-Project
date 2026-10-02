package com.billpro.printer;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "printers")
public class Printer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "business_id", nullable = false)
    private Long businessId;

    @Column(nullable = false)
    private String name = "SHREYANS SRS588";

    private String address;

    @Column(name = "connection_type", length = 50)
    private String connectionType = "BLUETOOTH";

    @Column(name = "paper_width")
    private Integer paperWidth = 58;

    @Column(length = 50)
    private String status = "DISCONNECTED";

    @Column(name = "last_connected_at")
    private LocalDateTime lastConnectedAt;

    public Printer() {}

    public Printer(Long id, Long businessId, String name, String address, String connectionType, Integer paperWidth, String status, LocalDateTime lastConnectedAt) {
        this.id = id;
        this.businessId = businessId;
        this.name = name != null ? name : "SHREYANS SRS588";
        this.address = address;
        this.connectionType = connectionType != null ? connectionType : "BLUETOOTH";
        this.paperWidth = paperWidth != null ? paperWidth : 58;
        this.status = status != null ? status : "DISCONNECTED";
        this.lastConnectedAt = lastConnectedAt;
    }

    public static PrinterBuilder builder() {
        return new PrinterBuilder();
    }

    public static class PrinterBuilder {
        private Long id;
        private Long businessId;
        private String name = "SHREYANS SRS588";
        private String address;
        private String connectionType = "BLUETOOTH";
        private Integer paperWidth = 58;
        private String status = "DISCONNECTED";
        private LocalDateTime lastConnectedAt;

        public PrinterBuilder id(Long id) { this.id = id; return this; }
        public PrinterBuilder businessId(Long businessId) { this.businessId = businessId; return this; }
        public PrinterBuilder name(String name) { this.name = name; return this; }
        public PrinterBuilder address(String address) { this.address = address; return this; }
        public PrinterBuilder connectionType(String connectionType) { this.connectionType = connectionType; return this; }
        public PrinterBuilder paperWidth(Integer paperWidth) { this.paperWidth = paperWidth; return this; }
        public PrinterBuilder status(String status) { this.status = status; return this; }
        public PrinterBuilder lastConnectedAt(LocalDateTime lastConnectedAt) { this.lastConnectedAt = lastConnectedAt; return this; }

        public Printer build() {
            return new Printer(id, businessId, name, address, connectionType, paperWidth, status, lastConnectedAt);
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getBusinessId() { return businessId; }
    public void setBusinessId(Long businessId) { this.businessId = businessId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public String getConnectionType() { return connectionType; }
    public void setConnectionType(String connectionType) { this.connectionType = connectionType; }
    public Integer getPaperWidth() { return paperWidth; }
    public void setPaperWidth(Integer paperWidth) { this.paperWidth = paperWidth; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDateTime getLastConnectedAt() { return lastConnectedAt; }
    public void setLastConnectedAt(LocalDateTime lastConnectedAt) { this.lastConnectedAt = lastConnectedAt; }
}
