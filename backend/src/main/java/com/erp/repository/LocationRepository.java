package com.erp.repository;

import com.erp.model.Location;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LocationRepository extends JpaRepository<Location, Long> {
    Optional<Location> findByCode(String code);
    Optional<Location> findByName(String name);
    List<Location> findByActiveTrue();
    List<Location> findByLocationType(String locationType);
}
