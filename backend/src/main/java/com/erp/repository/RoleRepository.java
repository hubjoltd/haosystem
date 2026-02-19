package com.erp.repository;

import com.erp.model.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface RoleRepository extends JpaRepository<Role, Long> {
    @Query("SELECT r FROM Role r WHERE r.name = :name ORDER BY r.id ASC LIMIT 1")
    Optional<Role> findByName(@Param("name") String name);
    
    List<Role> findByBranch_Id(Long branchId);
    
    @Query("SELECT r FROM Role r WHERE r.name = :name AND r.branch.id = :branchId ORDER BY r.id ASC LIMIT 1")
    Optional<Role> findByNameAndBranch_Id(@Param("name") String name, @Param("branchId") Long branchId);
    
    @Query("SELECT r FROM Role r WHERE r.branch.id = :branchId OR r.isSystemRole = true")
    List<Role> findByBranchIdOrSystemRole(@Param("branchId") Long branchId);
    
    @Query("SELECT r FROM Role r WHERE r.branch IS NULL OR r.isSystemRole = true")
    List<Role> findSystemRoles();
    
    @Query("SELECT CASE WHEN COUNT(r) > 0 THEN true ELSE false END FROM Role r WHERE r.name = :name AND r.branch.id = :branchId")
    boolean existsByNameAndBranchId(@Param("name") String name, @Param("branchId") Long branchId);
}
