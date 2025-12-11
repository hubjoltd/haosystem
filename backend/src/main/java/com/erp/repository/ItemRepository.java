package com.erp.repository;

import com.erp.model.Item;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ItemRepository extends JpaRepository<Item, Long> {
    Optional<Item> findByCode(String code);
    List<Item> findByGroupId(Long groupId);
    List<Item> findByStatus(String status);
    List<Item> findBySupplierId(Long supplierId);
    
    boolean existsByGroupId(Long groupId);
    boolean existsByCode(String code);
    boolean existsByNameAndGroupId(String name, Long groupId);
    
    long countByGroupId(Long groupId);
    long countByStatus(String status);
    
    @Query("SELECT i FROM Item i WHERE i.currentStock <= i.reorderLevel AND i.reorderLevel IS NOT NULL")
    List<Item> findLowStockItems();
    
    @Query("SELECT i FROM Item i WHERE i.group.id = :groupId AND i.name = :name AND i.id != :itemId")
    Optional<Item> findDuplicateName(@Param("groupId") Long groupId, @Param("name") String name, @Param("itemId") Long itemId);
}
