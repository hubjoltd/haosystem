package com.erp.service;

import com.erp.model.*;
import com.erp.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Service
public class DataInitializer {
    
    @Autowired private LocationRepository locationRepository;
    @Autowired private CostCenterRepository costCenterRepository;
    @Autowired private ExpenseCenterRepository expenseCenterRepository;
    @Autowired private DepartmentRepository departmentRepository;
    @Autowired private DesignationRepository designationRepository;
    @Autowired private JobRoleRepository jobRoleRepository;
    @Autowired private GradeRepository gradeRepository;
    @Autowired private EmployeeRepository employeeRepository;
    @Autowired private ItemGroupRepository itemGroupRepository;
    @Autowired private UnitOfMeasureRepository unitOfMeasureRepository;
    @Autowired private SupplierRepository supplierRepository;
    @Autowired private ItemRepository itemRepository;
    @Autowired private CustomerRepository customerRepository;
    @Autowired private ContractRepository contractRepository;
    @Autowired private WarehouseRepository warehouseRepository;
    @Autowired private BinRepository binRepository;
    @Autowired private LeaveTypeRepository leaveTypeRepository;
    @Autowired private AttendanceRuleRepository attendanceRuleRepository;
    @Autowired private SalaryHeadRepository salaryHeadRepository;
    @Autowired private PayFrequencyRepository payFrequencyRepository;
    @Autowired private HolidayRepository holidayRepository;
    @Autowired private ContractTypeRepository contractTypeRepository;
    @Autowired private ContractStatusRepository contractStatusRepository;
    @Autowired private BenefitPlanRepository benefitPlanRepository;
    @Autowired private ExpenseCategoryRepository expenseCategoryRepository;
    
    public void initializeData() {
        if (locationRepository.count() > 0) {
            return;
        }
        
        System.out.println("Initializing sample data...");
        
        initializeLocations();
        initializeCostCenters();
        initializeDepartments();
        initializeDesignations();
        initializeJobRoles();
        initializeGrades();
        initializeEmployees();
        initializeItemMasters();
        initializeCustomers();
        initializeContracts();
        initializeWarehouses();
        initializeLeaveTypes();
        initializeAttendanceRules();
        initializeSalaryHeads();
        initializePayFrequency();
        initializeHolidays();
        initializeBenefitPlans();
        initializeExpenseCategories();
        
        System.out.println("Sample data initialization completed!");
    }
    
    private void initializeLocations() {
        Location loc1 = new Location();
        loc1.setCode("NYC");
        loc1.setName("New York");
        loc1.setAddress("123 Broadway");
        loc1.setCity("New York");
        loc1.setState("NY");
        loc1.setCountry("USA");
        loc1.setActive(true);
        locationRepository.save(loc1);
        
        Location loc2 = new Location();
        loc2.setCode("LA");
        loc2.setName("Los Angeles");
        loc2.setAddress("456 Sunset Blvd");
        loc2.setCity("Los Angeles");
        loc2.setState("CA");
        loc2.setCountry("USA");
        loc2.setActive(true);
        locationRepository.save(loc2);
        
        Location loc3 = new Location();
        loc3.setCode("CHI");
        loc3.setName("Chicago");
        loc3.setAddress("789 Michigan Ave");
        loc3.setCity("Chicago");
        loc3.setState("IL");
        loc3.setCountry("USA");
        loc3.setActive(true);
        locationRepository.save(loc3);
    }
    
    private void initializeCostCenters() {
        CostCenter cc1 = new CostCenter();
        cc1.setCode("CC001");
        cc1.setName("Operations");
        cc1.setDescription("Operations cost center");
        cc1.setActive(true);
        costCenterRepository.save(cc1);
        
        CostCenter cc2 = new CostCenter();
        cc2.setCode("CC002");
        cc2.setName("Sales");
        cc2.setDescription("Sales cost center");
        cc2.setActive(true);
        costCenterRepository.save(cc2);
        
        CostCenter cc3 = new CostCenter();
        cc3.setCode("CC003");
        cc3.setName("IT");
        cc3.setDescription("IT cost center");
        cc3.setActive(true);
        costCenterRepository.save(cc3);
    }
    
    private void initializeDepartments() {
        Location loc = locationRepository.findAll().get(0);
        CostCenter cc = costCenterRepository.findAll().get(0);
        
        Department dept1 = new Department();
        dept1.setCode("DEPT001");
        dept1.setName("Human Resources");
        dept1.setDescription("HR Department");
        dept1.setLocation(loc);
        dept1.setCostCenter(cc);
        dept1.setActive(true);
        departmentRepository.save(dept1);
        
        Department dept2 = new Department();
        dept2.setCode("DEPT002");
        dept2.setName("Finance");
        dept2.setDescription("Finance Department");
        dept2.setLocation(loc);
        dept2.setCostCenter(cc);
        dept2.setActive(true);
        departmentRepository.save(dept2);
        
        Department dept3 = new Department();
        dept3.setCode("DEPT003");
        dept3.setName("Operations");
        dept3.setDescription("Operations Department");
        dept3.setLocation(loc);
        dept3.setCostCenter(cc);
        dept3.setActive(true);
        departmentRepository.save(dept3);
        
        Department dept4 = new Department();
        dept4.setCode("DEPT004");
        dept4.setName("IT");
        dept4.setDescription("Information Technology");
        dept4.setLocation(loc);
        dept4.setCostCenter(cc);
        dept4.setActive(true);
        departmentRepository.save(dept4);
    }
    
    private void initializeDesignations() {
        Designation des1 = new Designation();
        des1.setCode("MGR");
        des1.setName("Manager");
        des1.setDescription("Manager Level");
        des1.setActive(true);
        designationRepository.save(des1);
        
        Designation des2 = new Designation();
        des2.setCode("SR");
        des2.setName("Senior Executive");
        des2.setDescription("Senior Executive Level");
        des2.setActive(true);
        designationRepository.save(des2);
        
        Designation des3 = new Designation();
        des3.setCode("JR");
        des3.setName("Junior Executive");
        des3.setDescription("Junior Executive Level");
        des3.setActive(true);
        designationRepository.save(des3);
        
        Designation des4 = new Designation();
        des4.setCode("DIR");
        des4.setName("Director");
        des4.setDescription("Director Level");
        des4.setActive(true);
        designationRepository.save(des4);
    }
    
    private void initializeJobRoles() {
        JobRole role1 = new JobRole();
        role1.setCode("HR001");
        role1.setName("HR Manager");
        role1.setDescription("Human Resources Manager");
        role1.setActive(true);
        jobRoleRepository.save(role1);
        
        JobRole role2 = new JobRole();
        role2.setCode("FIN001");
        role2.setName("Finance Manager");
        role2.setDescription("Finance Manager");
        role2.setActive(true);
        jobRoleRepository.save(role2);
        
        JobRole role3 = new JobRole();
        role3.setCode("OPS001");
        role3.setName("Operations Manager");
        role3.setDescription("Operations Manager");
        role3.setActive(true);
        jobRoleRepository.save(role3);
    }
    
    private void initializeGrades() {
        Grade grade1 = new Grade();
        grade1.setCode("G1");
        grade1.setName("Grade 1");
        grade1.setActive(true);
        gradeRepository.save(grade1);
        
        Grade grade2 = new Grade();
        grade2.setCode("G2");
        grade2.setName("Grade 2");
        grade2.setActive(true);
        gradeRepository.save(grade2);
        
        Grade grade3 = new Grade();
        grade3.setCode("G3");
        grade3.setName("Grade 3");
        grade3.setActive(true);
        gradeRepository.save(grade3);
    }
    
    private void initializeEmployees() {
        Location loc = locationRepository.findAll().get(0);
        Department dept = departmentRepository.findAll().get(0);
        Designation des = designationRepository.findAll().get(0);
        JobRole role = jobRoleRepository.findAll().get(0);
        Grade grade = gradeRepository.findAll().get(0);
        CostCenter cc = costCenterRepository.findAll().get(0);
        
        Employee emp1 = new Employee();
        emp1.setEmployeeCode("EMP001");
        emp1.setFirstName("John");
        emp1.setLastName("Doe");
        emp1.setEmail("john.doe@company.com");
        emp1.setPhone("555-0001");
        emp1.setDateOfBirth(LocalDate.of(1990, 5, 15));
        emp1.setGender("Male");
        emp1.setMaritalStatus("Single");
        emp1.setNationality("USA");
        emp1.setDepartment(dept);
        emp1.setDesignation(des);
        emp1.setJobRole(role);
        emp1.setGrade(grade);
        emp1.setLocation(loc);
        emp1.setCostCenter(cc);
        emp1.setJoiningDate(LocalDate.of(2022, 1, 1));
        emp1.setConfirmationDate(LocalDate.of(2022, 4, 1));
        emp1.setEmploymentType("Permanent");
        emp1.setEmploymentStatus("Active");
        emp1.setActive(true);
        emp1.setPanNumber("AAAAA1234A");
        emp1.setNationalId("123456789");
        employeeRepository.save(emp1);
        
        Employee emp2 = new Employee();
        emp2.setEmployeeCode("EMP002");
        emp2.setFirstName("Jane");
        emp2.setLastName("Smith");
        emp2.setEmail("jane.smith@company.com");
        emp2.setPhone("555-0002");
        emp2.setDateOfBirth(LocalDate.of(1992, 8, 20));
        emp2.setGender("Female");
        emp2.setMaritalStatus("Married");
        emp2.setNationality("USA");
        emp2.setDepartment(dept);
        emp2.setDesignation(des);
        emp2.setJobRole(role);
        emp2.setGrade(grade);
        emp2.setLocation(loc);
        emp2.setCostCenter(cc);
        emp2.setJoiningDate(LocalDate.of(2021, 6, 15));
        emp2.setConfirmationDate(LocalDate.of(2021, 9, 15));
        emp2.setEmploymentType("Permanent");
        emp2.setEmploymentStatus("Active");
        emp2.setActive(true);
        emp2.setPanNumber("BBBBB5678B");
        emp2.setNationalId("987654321");
        employeeRepository.save(emp2);
        
        Employee emp3 = new Employee();
        emp3.setEmployeeCode("EMP003");
        emp3.setFirstName("Robert");
        emp3.setLastName("Wilson");
        emp3.setEmail("robert.wilson@company.com");
        emp3.setPhone("555-0003");
        emp3.setDateOfBirth(LocalDate.of(1988, 3, 10));
        emp3.setGender("Male");
        emp3.setMaritalStatus("Single");
        emp3.setNationality("USA");
        emp3.setDepartment(departmentRepository.findAll().get(1));
        emp3.setDesignation(designationRepository.findAll().get(1));
        emp3.setJobRole(jobRoleRepository.findAll().get(1));
        emp3.setGrade(grade);
        emp3.setLocation(loc);
        emp3.setCostCenter(cc);
        emp3.setJoiningDate(LocalDate.of(2020, 3, 1));
        emp3.setConfirmationDate(LocalDate.of(2020, 6, 1));
        emp3.setEmploymentType("Permanent");
        emp3.setEmploymentStatus("Active");
        emp3.setActive(true);
        emp3.setPanNumber("CCCCC9012C");
        emp3.setNationalId("456789123");
        employeeRepository.save(emp3);
        
        Employee emp4 = new Employee();
        emp4.setEmployeeCode("EMP004");
        emp4.setFirstName("Sarah");
        emp4.setLastName("Johnson");
        emp4.setEmail("sarah.johnson@company.com");
        emp4.setPhone("555-0004");
        emp4.setDateOfBirth(LocalDate.of(1995, 11, 5));
        emp4.setGender("Female");
        emp4.setMaritalStatus("Single");
        emp4.setNationality("USA");
        emp4.setDepartment(departmentRepository.findAll().get(2));
        emp4.setDesignation(designationRepository.findAll().get(2));
        emp4.setJobRole(jobRoleRepository.findAll().get(2));
        emp4.setGrade(gradeRepository.findAll().get(1));
        emp4.setLocation(locationRepository.findAll().get(1));
        emp4.setCostCenter(cc);
        emp4.setJoiningDate(LocalDate.of(2023, 1, 15));
        emp4.setConfirmationDate(LocalDate.of(2023, 4, 15));
        emp4.setEmploymentType("Permanent");
        emp4.setEmploymentStatus("Active");
        emp4.setActive(true);
        emp4.setPanNumber("DDDDD3456D");
        emp4.setNationalId("789123456");
        employeeRepository.save(emp4);
        
        Employee emp5 = new Employee();
        emp5.setEmployeeCode("EMP005");
        emp5.setFirstName("Michael");
        emp5.setLastName("Brown");
        emp5.setEmail("michael.brown@company.com");
        emp5.setPhone("555-0005");
        emp5.setDateOfBirth(LocalDate.of(1985, 7, 22));
        emp5.setGender("Male");
        emp5.setMaritalStatus("Married");
        emp5.setNationality("USA");
        emp5.setDepartment(departmentRepository.findAll().get(3));
        emp5.setDesignation(designationRepository.findAll().get(3));
        emp5.setJobRole(jobRoleRepository.findAll().get(0));
        emp5.setGrade(gradeRepository.findAll().get(0));
        emp5.setLocation(loc);
        emp5.setCostCenter(cc);
        emp5.setJoiningDate(LocalDate.of(2019, 5, 1));
        emp5.setConfirmationDate(LocalDate.of(2019, 8, 1));
        emp5.setEmploymentType("Permanent");
        emp5.setEmploymentStatus("Active");
        emp5.setReportingManager(emp1);
        emp5.setActive(true);
        emp5.setPanNumber("EEEEE7890E");
        emp5.setNationalId("123789456");
        employeeRepository.save(emp5);
    }
    
    private void initializeItemMasters() {
        ItemGroup group1 = new ItemGroup();
        group1.setCode("GROUP001");
        group1.setName("Raw Materials");
        group1.setDescription("Raw materials for production");
        group1.setActive(true);
        itemGroupRepository.save(group1);
        
        ItemGroup group2 = new ItemGroup();
        group2.setCode("GROUP002");
        group2.setName("Finished Goods");
        group2.setDescription("Finished products");
        group2.setActive(true);
        itemGroupRepository.save(group2);
        
        ItemGroup group3 = new ItemGroup();
        group3.setCode("GROUP003");
        group3.setName("Accessories");
        group3.setDescription("Product accessories");
        group3.setActive(true);
        itemGroupRepository.save(group3);
        
        UnitOfMeasure uom1 = new UnitOfMeasure();
        uom1.setCode("KG");
        uom1.setName("Kilogram");
        uom1.setDescription("Weight in Kilograms");
        uom1.setActive(true);
        unitOfMeasureRepository.save(uom1);
        
        UnitOfMeasure uom2 = new UnitOfMeasure();
        uom2.setCode("PCS");
        uom2.setName("Pieces");
        uom2.setDescription("Number of pieces");
        uom2.setActive(true);
        unitOfMeasureRepository.save(uom2);
        
        UnitOfMeasure uom3 = new UnitOfMeasure();
        uom3.setCode("LTR");
        uom3.setName("Liters");
        uom3.setDescription("Volume in Liters");
        uom3.setActive(true);
        unitOfMeasureRepository.save(uom3);
        
        Supplier supp1 = new Supplier();
        supp1.setCode("SUPP001");
        supp1.setName("Premier Supplies Inc");
        supp1.setEmail("contact@premiersupplies.com");
        supp1.setPhone("555-1001");
        supp1.setAddress("100 Supply Street");
        supp1.setCity("New York");
        supp1.setState("NY");
        supp1.setCountry("USA");
        supp1.setActive(true);
        supplierRepository.save(supp1);
        
        Supplier supp2 = new Supplier();
        supp2.setCode("SUPP002");
        supp2.setName("Global Trading Co");
        supp2.setEmail("info@globaltrading.com");
        supp2.setPhone("555-1002");
        supp2.setAddress("200 Trade Avenue");
        supp2.setCity("Los Angeles");
        supp2.setState("CA");
        supp2.setCountry("USA");
        supp2.setActive(true);
        supplierRepository.save(supp2);
        
        Item item1 = new Item();
        item1.setCode("ITEM001");
        item1.setName("Steel Bar");
        item1.setDescription("High quality steel bars");
        item1.setGroup(itemGroupRepository.findAll().get(0));
        item1.setUnitOfMeasure(uom1);
        item1.setUnitCost(new BigDecimal("150.00"));
        item1.setSupplier(supp1);
        item1.setTaxable(true);
        item1.setCurrentStock(500);
        item1.setReorderLevel(100);
        item1.setStatus("Active");
        itemRepository.save(item1);
        
        Item item2 = new Item();
        item2.setCode("ITEM002");
        item2.setName("Aluminum Plate");
        item2.setDescription("Premium aluminum plates");
        item2.setGroup(itemGroupRepository.findAll().get(0));
        item2.setUnitOfMeasure(uom1);
        item2.setUnitCost(new BigDecimal("200.00"));
        item2.setSupplier(supp2);
        item2.setTaxable(true);
        item2.setCurrentStock(300);
        item2.setReorderLevel(50);
        item2.setStatus("Active");
        itemRepository.save(item2);
        
        Item item3 = new Item();
        item3.setCode("ITEM003");
        item3.setName("Widget A");
        item3.setDescription("Standard widget");
        item3.setGroup(itemGroupRepository.findAll().get(1));
        item3.setUnitOfMeasure(uom2);
        item3.setUnitCost(new BigDecimal("25.00"));
        item3.setSupplier(supp1);
        item3.setTaxable(true);
        item3.setCurrentStock(1000);
        item3.setReorderLevel(200);
        item3.setStatus("Active");
        itemRepository.save(item3);
        
        Item item4 = new Item();
        item4.setCode("ITEM004");
        item4.setName("Lubricant Oil");
        item4.setDescription("Industrial lubricant");
        item4.setGroup(itemGroupRepository.findAll().get(0));
        item4.setUnitOfMeasure(uom3);
        item4.setUnitCost(new BigDecimal("50.00"));
        item4.setSupplier(supp2);
        item4.setTaxable(true);
        item4.setCurrentStock(200);
        item4.setReorderLevel(30);
        item4.setStatus("Active");
        itemRepository.save(item4);
    }
    
    private void initializeCustomers() {
        Customer cust1 = new Customer();
        cust1.setName("ABC Corporation");
        cust1.setEmail("contact@abccorp.com");
        cust1.setPhone("555-2001");
        cust1.setAddress("500 Business Blvd");
        cust1.setCustomerGroup("Enterprise");
        cust1.setStatus("Active");
        customerRepository.save(cust1);
        
        Customer cust2 = new Customer();
        cust2.setName("XYZ Manufacturing");
        cust2.setEmail("sales@xyzmanuf.com");
        cust2.setPhone("555-2002");
        cust2.setAddress("600 Industrial Way");
        cust2.setCustomerGroup("Commercial");
        cust2.setStatus("Active");
        customerRepository.save(cust2);
        
        Customer cust3 = new Customer();
        cust3.setName("Tech Solutions Ltd");
        cust3.setEmail("info@techsol.com");
        cust3.setPhone("555-2003");
        cust3.setAddress("700 Technology Drive");
        cust3.setCustomerGroup("SMB");
        cust3.setStatus("Active");
        customerRepository.save(cust3);
    }
    
    private void initializeContracts() {
        if (contractTypeRepository.count() == 0) {
            ContractType type1 = new ContractType();
            type1.setCode("SERVICE");
            type1.setName("Service Contract");
            type1.setActive(true);
            contractTypeRepository.save(type1);
            
            ContractType type2 = new ContractType();
            type2.setCode("SUPPLY");
            type2.setName("Supply Contract");
            type2.setActive(true);
            contractTypeRepository.save(type2);
        }
        
        if (contractStatusRepository.count() == 0) {
            ContractStatus status1 = new ContractStatus();
            status1.setCode("DRAFT");
            status1.setName("Draft");
            status1.setActive(true);
            contractStatusRepository.save(status1);
            
            ContractStatus status2 = new ContractStatus();
            status2.setCode("ACTIVE");
            status2.setName("Active");
            status2.setActive(true);
            contractStatusRepository.save(status2);
        }
    }
    
    private void initializeWarehouses() {
        Warehouse wh1 = new Warehouse();
        wh1.setCode("WH001");
        wh1.setName("Main Warehouse");
        wh1.setDescription("Main storage warehouse");
        wh1.setAddress("123 Warehouse St");
        wh1.setCity("New York");
        wh1.setState("NY");
        wh1.setActive(true);
        warehouseRepository.save(wh1);
        
        Warehouse wh2 = new Warehouse();
        wh2.setCode("WH002");
        wh2.setName("Secondary Warehouse");
        wh2.setDescription("Secondary storage");
        wh2.setAddress("456 Storage Ave");
        wh2.setCity("Los Angeles");
        wh2.setState("CA");
        wh2.setActive(true);
        warehouseRepository.save(wh2);
        
        Bin bin1 = new Bin();
        bin1.setCode("BIN001");
        bin1.setName("Bin A1");
        bin1.setLocation("Shelf 1");
        bin1.setWarehouse(wh1);
        bin1.setActive(true);
        binRepository.save(bin1);
        
        Bin bin2 = new Bin();
        bin2.setCode("BIN002");
        bin2.setName("Bin A2");
        bin2.setLocation("Shelf 2");
        bin2.setWarehouse(wh1);
        bin2.setActive(true);
        binRepository.save(bin2);
    }
    
    private void initializeLeaveTypes() {
        LeaveType leave1 = new LeaveType();
        leave1.setCode("PL");
        leave1.setName("Paid Leave");
        leave1.setDescription("Paid leave for employees");
        leave1.setDefaultDays(20);
        leave1.setCarryForward(5);
        leave1.setActive(true);
        leaveTypeRepository.save(leave1);
        
        LeaveType leave2 = new LeaveType();
        leave2.setCode("SL");
        leave2.setName("Sick Leave");
        leave2.setDescription("Medical leave");
        leave2.setDefaultDays(10);
        leave2.setCarryForward(3);
        leave2.setActive(true);
        leaveTypeRepository.save(leave2);
        
        LeaveType leave3 = new LeaveType();
        leave3.setCode("CL");
        leave3.setName("Casual Leave");
        leave3.setDescription("Casual leave");
        leave3.setDefaultDays(5);
        leave3.setCarryForward(0);
        leave3.setActive(true);
        leaveTypeRepository.save(leave3);
    }
    
    private void initializeAttendanceRules() {
        AttendanceRule rule1 = new AttendanceRule();
        rule1.setCode("RULE001");
        rule1.setName("Standard Attendance");
        rule1.setDescription("Standard 8-hour workday");
        rule1.setRegularHoursPerDay(8);
        rule1.setOvertimeMultiplier(new BigDecimal("1.5"));
        rule1.setBreakDeductionMinutes(60);
        rule1.setGracePeriodMinutes(15);
        rule1.setHalfDayHours(4);
        rule1.setActive(true);
        attendanceRuleRepository.save(rule1);
        
        AttendanceRule rule2 = new AttendanceRule();
        rule2.setCode("RULE002");
        rule2.setName("Flexible Attendance");
        rule2.setDescription("Flexible 6-hour workday");
        rule2.setRegularHoursPerDay(6);
        rule2.setOvertimeMultiplier(new BigDecimal("2.0"));
        rule2.setBreakDeductionMinutes(30);
        rule2.setGracePeriodMinutes(30);
        rule2.setHalfDayHours(3);
        rule2.setActive(true);
        attendanceRuleRepository.save(rule2);
    }
    
    private void initializeSalaryHeads() {
        SalaryHead head1 = new SalaryHead();
        head1.setCode("BASIC");
        head1.setName("Basic Salary");
        head1.setDescription("Base salary");
        head1.setHeadType("EARNING");
        head1.setIsEarning(true);
        head1.setIsDeduction(false);
        head1.setActive(true);
        salaryHeadRepository.save(head1);
        
        SalaryHead head2 = new SalaryHead();
        head2.setCode("HRA");
        head2.setName("House Rent Allowance");
        head2.setDescription("Rent allowance");
        head2.setHeadType("EARNING");
        head2.setIsEarning(true);
        head2.setIsDeduction(false);
        head2.setActive(true);
        salaryHeadRepository.save(head2);
        
        SalaryHead head3 = new SalaryHead();
        head3.setCode("PF");
        head3.setName("Provident Fund");
        head3.setDescription("PF contribution");
        head3.setHeadType("DEDUCTION");
        head3.setIsEarning(false);
        head3.setIsDeduction(true);
        head3.setActive(true);
        salaryHeadRepository.save(head3);
        
        SalaryHead head4 = new SalaryHead();
        head4.setCode("TDS");
        head4.setName("Tax Deducted at Source");
        head4.setDescription("Income tax");
        head4.setHeadType("DEDUCTION");
        head4.setIsEarning(false);
        head4.setIsDeduction(true);
        head4.setActive(true);
        salaryHeadRepository.save(head4);
    }
    
    private void initializePayFrequency() {
        PayFrequency freq1 = new PayFrequency();
        freq1.setCode("MONTHLY");
        freq1.setName("Monthly");
        freq1.setDays(30);
        freq1.setActive(true);
        payFrequencyRepository.save(freq1);
        
        PayFrequency freq2 = new PayFrequency();
        freq2.setCode("WEEKLY");
        freq2.setName("Weekly");
        freq2.setDays(7);
        freq2.setActive(true);
        payFrequencyRepository.save(freq2);
    }
    
    private void initializeHolidays() {
        Holiday hol1 = new Holiday();
        hol1.setCode("NY1");
        hol1.setName("New Year");
        hol1.setDate(LocalDate.of(2024, 1, 1));
        hol1.setDescription("New Year Holiday");
        hol1.setActive(true);
        holidayRepository.save(hol1);
        
        Holiday hol2 = new Holiday();
        hol2.setCode("IND");
        hol2.setName("Independence Day");
        hol2.setDate(LocalDate.of(2024, 7, 4));
        hol2.setDescription("Independence Day Holiday");
        hol2.setActive(true);
        holidayRepository.save(hol2);
        
        Holiday hol3 = new Holiday();
        hol3.setCode("XMAS");
        hol3.setName("Christmas");
        hol3.setDate(LocalDate.of(2024, 12, 25));
        hol3.setDescription("Christmas Holiday");
        hol3.setActive(true);
        holidayRepository.save(hol3);
    }
    
    private void initializeBenefitPlans() {
        BenefitPlan plan1 = new BenefitPlan();
        plan1.setCode("HEALTH");
        plan1.setName("Health Insurance");
        plan1.setDescription("Basic health insurance");
        plan1.setActive(true);
        benefitPlanRepository.save(plan1);
        
        BenefitPlan plan2 = new BenefitPlan();
        plan2.setCode("DENTAL");
        plan2.setName("Dental Plan");
        plan2.setDescription("Dental coverage");
        plan2.setActive(true);
        benefitPlanRepository.save(plan2);
    }
    
    private void initializeExpenseCategories() {
        ExpenseCategory cat1 = new ExpenseCategory();
        cat1.setCode("TRAVEL");
        cat1.setName("Travel");
        cat1.setDescription("Travel expenses");
        cat1.setActive(true);
        expenseCategoryRepository.save(cat1);
        
        ExpenseCategory cat2 = new ExpenseCategory();
        cat2.setCode("MEALS");
        cat2.setName("Meals");
        cat2.setDescription("Meal expenses");
        cat2.setActive(true);
        expenseCategoryRepository.save(cat2);
        
        ExpenseCategory cat3 = new ExpenseCategory();
        cat3.setCode("ACCOM");
        cat3.setName("Accommodation");
        cat3.setDescription("Hotel and lodging");
        cat3.setActive(true);
        expenseCategoryRepository.save(cat3);
    }
}
