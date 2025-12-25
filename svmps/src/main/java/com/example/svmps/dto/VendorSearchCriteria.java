package com.example.svmps.dto;

public class VendorSearchCriteria {

    private String location;
    private String category;
    private Boolean compliance;
    private Double minRating;

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public Boolean getCompliance() {
        return compliance;
    }

    public void setCompliance(Boolean compliance) {
        this.compliance = compliance;
    }

    public Double getMinRating() {
        return minRating;
    }

    public void setMinRating(Double minRating) {
        this.minRating = minRating;
    }
}
