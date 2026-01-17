package com.erp.repository;

import com.erp.model.Bill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface BillRepository extends JpaRepository<Bill, Long> {
    Optional<Bill> findByBillNumber(String billNumber);
    List<Bill> findByStatusOrderByBillDateDesc(String status);
    List<Bill> findBySupplierIdOrderByBillDateDesc(Long supplierId);
    List<Bill> findByDueDateBeforeAndStatusNot(LocalDate date, String status);
    
    @Query("SELECT SUM(b.balanceDue) FROM Bill b WHERE b.status NOT IN ('Paid', 'Cancelled')")
    BigDecimal sumOutstandingPayables();
    
    @Query("SELECT b FROM Bill b WHERE b.balanceDue > 0 ORDER BY b.dueDate")
    List<Bill> findUnpaidBills();
    
    @Query("SELECT COALESCE(MAX(CAST(SUBSTRING(b.billNumber, 6) AS integer)), 0) FROM Bill b WHERE b.billNumber LIKE 'BILL-%'")
    Integer findMaxBillNumber();
    
    @Query("SELECT b FROM Bill b WHERE b.supplier.id = :supplierId AND b.balanceDue > 0 ORDER BY b.dueDate")
    List<Bill> findUnpaidBillsBySupplierId(@Param("supplierId") Long supplierId);
}
