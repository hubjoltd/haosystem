package com.erp.config;

import com.erp.model.*;
import com.erp.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import com.erp.service.UserNotificationService;

@Component
@Order(2)
public class DataSeeder implements CommandLineRunner {

    @Autowired private DepartmentRepository departmentRepository;
    @Autowired private DesignationRepository designationRepository;
    @Autowired private EmployeeRepository employeeRepository;
    @Autowired private CustomerRepository customerRepository;
    @Autowired private SupplierRepository supplierRepository;
    @Autowired private ItemGroupRepository itemGroupRepository;
    @Autowired private UnitOfMeasureRepository unitOfMeasureRepository;
    @Autowired private ItemRepository itemRepository;
    @Autowired private WarehouseRepository warehouseRepository;
    @Autowired private LeaveTypeRepository leaveTypeRepository;
    @Autowired private ProjectRepository projectRepository;
    @Autowired private ContractRepository contractRepository;
    @Autowired private ExpenseCategoryRepository expenseCategoryRepository;
    @Autowired private TrainingProgramRepository trainingProgramRepository;
    @Autowired private ChartOfAccountRepository chartOfAccountRepository;
    @Autowired private BankAccountRepository bankAccountRepository;
    @Autowired private GradeRepository gradeRepository;
    @Autowired private LocationRepository locationRepository;
    @Autowired private CostCenterRepository costCenterRepository;
    @Autowired private HolidayRepository holidayRepository;
    @Autowired private SalaryBandRepository salaryBandRepository;
    @Autowired private UserNotificationRepository userNotificationRepository;
    @Autowired private UserNotificationService userNotificationService;

    @Override
    public void run(String... args) throws Exception {
        try {
            seedLocations();
            seedCostCenters();
            seedGrades();
            seedDepartments();
            seedDesignations();
            seedEmployees();
            seedCustomers();
            seedSuppliers();
            seedUnitOfMeasures();
            seedItemGroups();
            seedItems();
            seedWarehouses();
            seedLeaveTypes();
            seedProjects();
            seedContracts();
            seedExpenseCategories();
            seedTrainingPrograms();
            seedChartOfAccounts();
            seedBankAccounts();
            seedHolidays();
            seedSalaryBands();
            seedNotifications();
            
            System.out.println("Sample data seeding completed!");
        } catch (Exception e) {
            System.out.println("Data seeding skipped or partially completed: " + e.getMessage());
        }
    }

    private void seedLocations() {
        if (locationRepository.count() > 0) return;
        
        Location loc1 = new Location();
        loc1.setCode("LOC-MUM");
        loc1.setName("Mumbai Office");
        loc1.setCity("Mumbai");
        loc1.setState("Maharashtra");
        loc1.setCountry("India");
        loc1.setActive(true);
        locationRepository.save(loc1);

        Location loc2 = new Location();
        loc2.setCode("LOC-DEL");
        loc2.setName("Delhi Office");
        loc2.setCity("New Delhi");
        loc2.setState("Delhi");
        loc2.setCountry("India");
        loc2.setActive(true);
        locationRepository.save(loc2);

        Location loc3 = new Location();
        loc3.setCode("LOC-BLR");
        loc3.setName("Bangalore Office");
        loc3.setCity("Bangalore");
        loc3.setState("Karnataka");
        loc3.setCountry("India");
        loc3.setActive(true);
        locationRepository.save(loc3);
    }

    private void seedCostCenters() {
        if (costCenterRepository.count() > 0) return;
        
        CostCenter cc1 = new CostCenter();
        cc1.setCode("CC-ADMIN");
        cc1.setName("Administration");
        cc1.setDescription("Administrative Cost Center");
        cc1.setActive(true);
        costCenterRepository.save(cc1);

        CostCenter cc2 = new CostCenter();
        cc2.setCode("CC-TECH");
        cc2.setName("Technology");
        cc2.setDescription("Technology Cost Center");
        cc2.setActive(true);
        costCenterRepository.save(cc2);

        CostCenter cc3 = new CostCenter();
        cc3.setCode("CC-SALES");
        cc3.setName("Sales & Marketing");
        cc3.setDescription("Sales and Marketing Cost Center");
        cc3.setActive(true);
        costCenterRepository.save(cc3);
    }

    private void seedGrades() {
        if (gradeRepository.count() > 0) return;
        
        Grade g1 = new Grade();
        g1.setCode("G1");
        g1.setName("Entry Level");
        g1.setDescription("Fresh graduates and junior staff");
        g1.setActive(true);
        gradeRepository.save(g1);

        Grade g2 = new Grade();
        g2.setCode("G2");
        g2.setName("Mid Level");
        g2.setDescription("Experienced professionals");
        g2.setActive(true);
        gradeRepository.save(g2);

        Grade g3 = new Grade();
        g3.setCode("G3");
        g3.setName("Senior Level");
        g3.setDescription("Senior professionals and managers");
        g3.setActive(true);
        gradeRepository.save(g3);
    }

    private void seedDepartments() {
        if (departmentRepository.count() > 0) return;
        
        Department dept1 = new Department();
        dept1.setCode("DEPT-HR");
        dept1.setName("Human Resources");
        dept1.setDescription("HR and People Operations");
        dept1.setActive(true);
        departmentRepository.save(dept1);

        Department dept2 = new Department();
        dept2.setCode("DEPT-FIN");
        dept2.setName("Finance");
        dept2.setDescription("Finance and Accounting");
        dept2.setActive(true);
        departmentRepository.save(dept2);

        Department dept3 = new Department();
        dept3.setCode("DEPT-IT");
        dept3.setName("Information Technology");
        dept3.setDescription("IT and Software Development");
        dept3.setActive(true);
        departmentRepository.save(dept3);
    }

    private void seedDesignations() {
        if (designationRepository.count() > 0) return;
        
        List<Grade> grades = gradeRepository.findAll();
        Grade seniorGrade = grades.size() > 2 ? grades.get(2) : null;
        Grade midGrade = grades.size() > 1 ? grades.get(1) : null;
        Grade entryGrade = grades.size() > 0 ? grades.get(0) : null;
        
        Designation des1 = new Designation();
        des1.setCode("DES-MGR");
        des1.setTitle("Manager");
        des1.setDescription("Department Manager");
        des1.setGrade(seniorGrade);
        des1.setActive(true);
        designationRepository.save(des1);

        Designation des2 = new Designation();
        des2.setCode("DES-SR-ENG");
        des2.setTitle("Senior Engineer");
        des2.setDescription("Senior Software Engineer");
        des2.setGrade(midGrade);
        des2.setActive(true);
        designationRepository.save(des2);

        Designation des3 = new Designation();
        des3.setCode("DES-ANALYST");
        des3.setTitle("Analyst");
        des3.setDescription("Business Analyst");
        des3.setGrade(entryGrade);
        des3.setActive(true);
        designationRepository.save(des3);
    }

    private void seedEmployees() {
        if (employeeRepository.count() > 0) return;
        
        List<Department> departments = departmentRepository.findAll();
        List<Designation> designations = designationRepository.findAll();
        
        Employee emp1 = new Employee();
        emp1.setEmployeeCode("EMP-001");
        emp1.setFirstName("Rajesh");
        emp1.setLastName("Sharma");
        emp1.setEmail("rajesh.sharma@company.com");
        emp1.setPhone("+91-9876543210");
        emp1.setGender("Male");
        emp1.setDateOfBirth(LocalDate.of(1985, 5, 15));
        emp1.setMaritalStatus("Married");
        emp1.setNationality("Indian");
        emp1.setJoiningDate(LocalDate.of(2020, 1, 15));
        emp1.setEmploymentType("Full-Time");
        emp1.setEmploymentStatus("Active");
        emp1.setPermanentCity("Mumbai");
        emp1.setPermanentState("Maharashtra");
        emp1.setPermanentCountry("India");
        emp1.setSalary(new BigDecimal("75000"));
        emp1.setHourlyRate(new BigDecimal("450"));
        if (!departments.isEmpty()) emp1.setDepartment(departments.get(0));
        if (!designations.isEmpty()) emp1.setDesignation(designations.get(0));
        employeeRepository.save(emp1);

        Employee emp2 = new Employee();
        emp2.setEmployeeCode("EMP-002");
        emp2.setFirstName("Priya");
        emp2.setLastName("Patel");
        emp2.setEmail("priya.patel@company.com");
        emp2.setPhone("+91-9876543211");
        emp2.setGender("Female");
        emp2.setDateOfBirth(LocalDate.of(1990, 8, 22));
        emp2.setMaritalStatus("Single");
        emp2.setNationality("Indian");
        emp2.setJoiningDate(LocalDate.of(2021, 3, 10));
        emp2.setEmploymentType("Full-Time");
        emp2.setEmploymentStatus("Active");
        emp2.setPermanentCity("Ahmedabad");
        emp2.setPermanentState("Gujarat");
        emp2.setPermanentCountry("India");
        emp2.setSalary(new BigDecimal("65000"));
        emp2.setHourlyRate(new BigDecimal("390"));
        if (departments.size() > 1) emp2.setDepartment(departments.get(1));
        if (designations.size() > 1) emp2.setDesignation(designations.get(1));
        employeeRepository.save(emp2);

        Employee emp3 = new Employee();
        emp3.setEmployeeCode("EMP-003");
        emp3.setFirstName("Amit");
        emp3.setLastName("Verma");
        emp3.setEmail("amit.verma@company.com");
        emp3.setPhone("+91-9876543212");
        emp3.setGender("Male");
        emp3.setDateOfBirth(LocalDate.of(1992, 12, 5));
        emp3.setMaritalStatus("Married");
        emp3.setNationality("Indian");
        emp3.setJoiningDate(LocalDate.of(2022, 6, 1));
        emp3.setEmploymentType("Full-Time");
        emp3.setEmploymentStatus("Active");
        emp3.setPermanentCity("Delhi");
        emp3.setPermanentState("Delhi");
        emp3.setPermanentCountry("India");
        emp3.setSalary(new BigDecimal("55000"));
        emp3.setHourlyRate(new BigDecimal("330"));
        if (departments.size() > 2) emp3.setDepartment(departments.get(2));
        if (designations.size() > 2) emp3.setDesignation(designations.get(2));
        employeeRepository.save(emp3);
    }

    private void seedCustomers() {
        if (customerRepository.count() > 0) return;
        
        Customer cust1 = new Customer();
        cust1.setName("Tata Consultancy Services");
        cust1.setEmail("contact@tcs.com");
        cust1.setPhone("+91-22-67789999");
        cust1.setAddress("TCS House, Raveline Street, Fort, Mumbai");
        cust1.setCustomerGroup("Enterprise");
        cust1.setStatus("Active");
        customerRepository.save(cust1);

        Customer cust2 = new Customer();
        cust2.setName("Infosys Limited");
        cust2.setEmail("contact@infosys.com");
        cust2.setPhone("+91-80-28520261");
        cust2.setAddress("Electronics City, Hosur Road, Bangalore");
        cust2.setCustomerGroup("Enterprise");
        cust2.setStatus("Active");
        customerRepository.save(cust2);

        Customer cust3 = new Customer();
        cust3.setName("Wipro Technologies");
        cust3.setEmail("contact@wipro.com");
        cust3.setPhone("+91-80-28440011");
        cust3.setAddress("Doddakannelli, Sarjapur Road, Bangalore");
        cust3.setCustomerGroup("Enterprise");
        cust3.setStatus("Active");
        customerRepository.save(cust3);
    }

    private void seedSuppliers() {
        if (supplierRepository.count() > 0) return;
        
        Supplier sup1 = new Supplier();
        sup1.setCode("SUP-001");
        sup1.setName("Reliance Industries Ltd");
        sup1.setContactPerson("Mukesh Agarwal");
        sup1.setEmail("procurement@ril.com");
        sup1.setPhone("+91-22-35553000");
        sup1.setAddress("Maker Chambers IV, Nariman Point, Mumbai");
        sup1.setPaymentTerms("Net 30");
        sup1.setStatus("Active");
        supplierRepository.save(sup1);

        Supplier sup2 = new Supplier();
        sup2.setCode("SUP-002");
        sup2.setName("Hindustan Unilever Limited");
        sup2.setContactPerson("Sanjay Mishra");
        sup2.setEmail("supply@hul.com");
        sup2.setPhone("+91-22-39832000");
        sup2.setAddress("Unilever House, BG Kher Marg, Mumbai");
        sup2.setPaymentTerms("Net 45");
        sup2.setStatus("Active");
        supplierRepository.save(sup2);

        Supplier sup3 = new Supplier();
        sup3.setCode("SUP-003");
        sup3.setName("Mahindra & Mahindra Ltd");
        sup3.setContactPerson("Ravi Krishnan");
        sup3.setEmail("vendors@mahindra.com");
        sup3.setPhone("+91-22-24901441");
        sup3.setAddress("Gateway Building, Apollo Bunder, Mumbai");
        sup3.setPaymentTerms("Net 30");
        sup3.setStatus("Active");
        supplierRepository.save(sup3);
    }

    private void seedUnitOfMeasures() {
        if (unitOfMeasureRepository.count() > 0) return;
        
        UnitOfMeasure uom1 = new UnitOfMeasure();
        uom1.setCode("PCS");
        uom1.setName("Pieces");
        uom1.setSymbol("pc");
        uom1.setStatus("Active");
        unitOfMeasureRepository.save(uom1);

        UnitOfMeasure uom2 = new UnitOfMeasure();
        uom2.setCode("KG");
        uom2.setName("Kilograms");
        uom2.setSymbol("kg");
        uom2.setStatus("Active");
        unitOfMeasureRepository.save(uom2);

        UnitOfMeasure uom3 = new UnitOfMeasure();
        uom3.setCode("LTR");
        uom3.setName("Liters");
        uom3.setSymbol("L");
        uom3.setStatus("Active");
        unitOfMeasureRepository.save(uom3);
    }

    private void seedItemGroups() {
        if (itemGroupRepository.count() > 0) return;
        
        ItemGroup ig1 = new ItemGroup();
        ig1.setCode("IG-ELEC");
        ig1.setName("Electronics");
        ig1.setDescription("Electronic equipment and components");
        ig1.setStatus("Active");
        itemGroupRepository.save(ig1);

        ItemGroup ig2 = new ItemGroup();
        ig2.setCode("IG-OFF");
        ig2.setName("Office Supplies");
        ig2.setDescription("Office stationery and supplies");
        ig2.setStatus("Active");
        itemGroupRepository.save(ig2);

        ItemGroup ig3 = new ItemGroup();
        ig3.setCode("IG-RAW");
        ig3.setName("Raw Materials");
        ig3.setDescription("Raw materials for production");
        ig3.setStatus("Active");
        itemGroupRepository.save(ig3);
    }

    private void seedItems() {
        if (itemRepository.count() > 0) return;
        
        List<ItemGroup> groups = itemGroupRepository.findAll();
        List<UnitOfMeasure> uoms = unitOfMeasureRepository.findAll();
        
        if (groups.isEmpty() || uoms.isEmpty()) return;
        
        Item item1 = new Item();
        item1.setCode("ITM-001");
        item1.setName("Laptop Dell Latitude");
        item1.setDescription("Dell Latitude 5520 Business Laptop");
        item1.setGroup(groups.get(0));
        item1.setUnitOfMeasure(uoms.get(0));
        item1.setUnitCost(new BigDecimal("75000.00"));
        item1.setCurrentStock(50);
        item1.setReorderLevel(10);
        item1.setStatus("Active");
        item1.setTaxable(true);
        item1.setCreatedDate(LocalDateTime.now());
        itemRepository.save(item1);

        Item item2 = new Item();
        item2.setCode("ITM-002");
        item2.setName("A4 Paper Ream");
        item2.setDescription("500 sheets A4 white paper");
        item2.setGroup(groups.size() > 1 ? groups.get(1) : groups.get(0));
        item2.setUnitOfMeasure(uoms.get(0));
        item2.setUnitCost(new BigDecimal("350.00"));
        item2.setCurrentStock(200);
        item2.setReorderLevel(50);
        item2.setStatus("Active");
        item2.setTaxable(true);
        item2.setCreatedDate(LocalDateTime.now());
        itemRepository.save(item2);

        Item item3 = new Item();
        item3.setCode("ITM-003");
        item3.setName("Steel Sheets");
        item3.setDescription("Stainless steel sheets 4x8 ft");
        item3.setGroup(groups.size() > 2 ? groups.get(2) : groups.get(0));
        item3.setUnitOfMeasure(uoms.size() > 1 ? uoms.get(1) : uoms.get(0));
        item3.setUnitCost(new BigDecimal("2500.00"));
        item3.setCurrentStock(100);
        item3.setReorderLevel(20);
        item3.setStatus("Active");
        item3.setTaxable(true);
        item3.setCreatedDate(LocalDateTime.now());
        itemRepository.save(item3);
    }

    private void seedWarehouses() {
        if (warehouseRepository.count() > 0) return;
        
        Warehouse wh1 = new Warehouse();
        wh1.setCode("WH-MUM");
        wh1.setName("Mumbai Warehouse");
        wh1.setAddress("Plot 45, MIDC Industrial Area, Andheri East, Mumbai");
        wh1.setStatus("Active");
        warehouseRepository.save(wh1);

        Warehouse wh2 = new Warehouse();
        wh2.setCode("WH-DEL");
        wh2.setName("Delhi Warehouse");
        wh2.setAddress("Block C, Okhla Industrial Estate, New Delhi");
        wh2.setStatus("Active");
        warehouseRepository.save(wh2);

        Warehouse wh3 = new Warehouse();
        wh3.setCode("WH-CHN");
        wh3.setName("Chennai Warehouse");
        wh3.setAddress("Guindy Industrial Estate, Chennai");
        wh3.setStatus("Active");
        warehouseRepository.save(wh3);
    }

    private void seedLeaveTypes() {
        if (leaveTypeRepository.count() > 0) return;
        
        LeaveType lt1 = new LeaveType();
        lt1.setCode("LT-CL");
        lt1.setName("Casual Leave");
        lt1.setDescription("Casual leave for personal matters");
        lt1.setAnnualEntitlement(new BigDecimal("12"));
        lt1.setAccrualType("MONTHLY");
        lt1.setCarryForwardAllowed(false);
        lt1.setRequiresApproval(true);
        lt1.setIsActive(true);
        leaveTypeRepository.save(lt1);

        LeaveType lt2 = new LeaveType();
        lt2.setCode("LT-SL");
        lt2.setName("Sick Leave");
        lt2.setDescription("Leave for medical reasons");
        lt2.setAnnualEntitlement(new BigDecimal("10"));
        lt2.setAccrualType("ANNUALLY");
        lt2.setCarryForwardAllowed(true);
        lt2.setMaxCarryForward(new BigDecimal("5"));
        lt2.setRequiresApproval(true);
        lt2.setIsActive(true);
        leaveTypeRepository.save(lt2);

        LeaveType lt3 = new LeaveType();
        lt3.setCode("LT-EL");
        lt3.setName("Earned Leave");
        lt3.setDescription("Paid earned leave");
        lt3.setAnnualEntitlement(new BigDecimal("15"));
        lt3.setAccrualType("MONTHLY");
        lt3.setCarryForwardAllowed(true);
        lt3.setMaxCarryForward(new BigDecimal("30"));
        lt3.setEncashmentAllowed(true);
        lt3.setRequiresApproval(true);
        lt3.setIsActive(true);
        leaveTypeRepository.save(lt3);
    }

    private void seedProjects() {
        if (projectRepository.count() > 0) return;
        
        List<Customer> customers = customerRepository.findAll();
        
        Project proj1 = new Project();
        proj1.setProjectCode("PRJ-2024-001");
        proj1.setName("Digital Transformation Initiative");
        proj1.setDescription("Enterprise-wide digital transformation project");
        if (!customers.isEmpty()) proj1.setCustomer(customers.get(0));
        proj1.setBillingType("Fixed Price");
        proj1.setStatus("In Progress");
        proj1.setProgress(45);
        proj1.setStartDate(LocalDate.of(2024, 1, 1));
        proj1.setEndDate(LocalDate.of(2024, 12, 31));
        proj1.setEstimatedHours(new BigDecimal("5000"));
        proj1.setEstimatedCost(new BigDecimal("15000000"));
        projectRepository.save(proj1);

        Project proj2 = new Project();
        proj2.setProjectCode("PRJ-2024-002");
        proj2.setName("Cloud Migration Project");
        proj2.setDescription("Migrate on-premise systems to cloud");
        if (customers.size() > 1) proj2.setCustomer(customers.get(1));
        proj2.setBillingType("Time & Material");
        proj2.setStatus("In Progress");
        proj2.setProgress(30);
        proj2.setStartDate(LocalDate.of(2024, 3, 1));
        proj2.setEndDate(LocalDate.of(2024, 9, 30));
        proj2.setEstimatedHours(new BigDecimal("3000"));
        proj2.setEstimatedCost(new BigDecimal("8000000"));
        projectRepository.save(proj2);

        Project proj3 = new Project();
        proj3.setProjectCode("PRJ-2024-003");
        proj3.setName("ERP Implementation");
        proj3.setDescription("Implement new ERP system");
        if (customers.size() > 2) proj3.setCustomer(customers.get(2));
        proj3.setBillingType("Fixed Price");
        proj3.setStatus("Planning");
        proj3.setProgress(10);
        proj3.setStartDate(LocalDate.of(2024, 6, 1));
        proj3.setEndDate(LocalDate.of(2025, 5, 31));
        proj3.setEstimatedHours(new BigDecimal("8000"));
        proj3.setEstimatedCost(new BigDecimal("25000000"));
        projectRepository.save(proj3);
    }

    private void seedContracts() {
        if (contractRepository.count() > 0) return;
        
        List<Customer> customers = customerRepository.findAll();
        
        Contract con1 = new Contract();
        con1.setContractNumber("CON-2024-001");
        con1.setTitle("Annual Maintenance Contract");
        con1.setDescription("Annual software maintenance and support");
        if (!customers.isEmpty()) con1.setCustomer(customers.get(0));
        con1.setStatus("Active");
        con1.setStartDate(LocalDate.of(2024, 1, 1));
        con1.setEndDate(LocalDate.of(2024, 12, 31));
        con1.setValue(new BigDecimal("5000000"));
        contractRepository.save(con1);

        Contract con2 = new Contract();
        con2.setContractNumber("CON-2024-002");
        con2.setTitle("Software License Agreement");
        con2.setDescription("Enterprise software licensing");
        if (customers.size() > 1) con2.setCustomer(customers.get(1));
        con2.setStatus("Active");
        con2.setStartDate(LocalDate.of(2024, 4, 1));
        con2.setEndDate(LocalDate.of(2027, 3, 31));
        con2.setValue(new BigDecimal("12000000"));
        contractRepository.save(con2);

        Contract con3 = new Contract();
        con3.setContractNumber("CON-2024-003");
        con3.setTitle("Consulting Services Agreement");
        con3.setDescription("IT consulting and advisory services");
        if (customers.size() > 2) con3.setCustomer(customers.get(2));
        con3.setStatus("Active");
        con3.setStartDate(LocalDate.of(2024, 2, 1));
        con3.setEndDate(LocalDate.of(2025, 1, 31));
        con3.setValue(new BigDecimal("8000000"));
        contractRepository.save(con3);
    }

    private void seedExpenseCategories() {
        if (expenseCategoryRepository.count() > 0) return;
        
        ExpenseCategory ec1 = new ExpenseCategory();
        ec1.setCode("EXP-TRV");
        ec1.setName("Travel & Conveyance");
        ec1.setDescription("Travel, transport and conveyance expenses");
        ec1.setActive(true);
        expenseCategoryRepository.save(ec1);

        ExpenseCategory ec2 = new ExpenseCategory();
        ec2.setCode("EXP-MEAL");
        ec2.setName("Meals & Entertainment");
        ec2.setDescription("Business meals and client entertainment");
        ec2.setActive(true);
        expenseCategoryRepository.save(ec2);

        ExpenseCategory ec3 = new ExpenseCategory();
        ec3.setCode("EXP-OFF");
        ec3.setName("Office Expenses");
        ec3.setDescription("Office supplies and equipment");
        ec3.setActive(true);
        expenseCategoryRepository.save(ec3);
    }

    private void seedTrainingPrograms() {
        if (trainingProgramRepository.count() > 0) return;
        
        TrainingProgram tp1 = new TrainingProgram();
        tp1.setProgramCode("TRN-001");
        tp1.setName("Leadership Development Program");
        tp1.setDescription("Developing future leaders");
        tp1.setTrainingType("Internal");
        tp1.setDeliveryMode("Classroom");
        tp1.setDurationHours(40);
        tp1.setMaxParticipants(25);
        tp1.setIsActive(true);
        trainingProgramRepository.save(tp1);

        TrainingProgram tp2 = new TrainingProgram();
        tp2.setProgramCode("TRN-002");
        tp2.setName("Technical Skills Workshop");
        tp2.setDescription("Advanced technical skills training");
        tp2.setTrainingType("External");
        tp2.setDeliveryMode("Online");
        tp2.setDurationHours(24);
        tp2.setMaxParticipants(50);
        tp2.setIsActive(true);
        trainingProgramRepository.save(tp2);

        TrainingProgram tp3 = new TrainingProgram();
        tp3.setProgramCode("TRN-003");
        tp3.setName("Communication Skills");
        tp3.setDescription("Effective business communication");
        tp3.setTrainingType("Internal");
        tp3.setDeliveryMode("Hybrid");
        tp3.setDurationHours(16);
        tp3.setMaxParticipants(30);
        tp3.setIsActive(true);
        trainingProgramRepository.save(tp3);
    }

    private void seedChartOfAccounts() {
        if (chartOfAccountRepository.count() > 0) return;
        
        ChartOfAccount coa1 = new ChartOfAccount();
        coa1.setAccountCode("1000");
        coa1.setAccountName("Cash and Bank");
        coa1.setAccountType("ASSET");
        coa1.setDescription("Cash and bank balances");
        coa1.setStatus("Active");
        chartOfAccountRepository.save(coa1);

        ChartOfAccount coa2 = new ChartOfAccount();
        coa2.setAccountCode("2000");
        coa2.setAccountName("Accounts Payable");
        coa2.setAccountType("LIABILITY");
        coa2.setDescription("Trade payables");
        coa2.setStatus("Active");
        chartOfAccountRepository.save(coa2);

        ChartOfAccount coa3 = new ChartOfAccount();
        coa3.setAccountCode("4000");
        coa3.setAccountName("Sales Revenue");
        coa3.setAccountType("INCOME");
        coa3.setDescription("Revenue from sales");
        coa3.setStatus("Active");
        chartOfAccountRepository.save(coa3);
    }

    private void seedBankAccounts() {
        if (bankAccountRepository.count() > 0) return;
        
        List<ChartOfAccount> accounts = chartOfAccountRepository.findAll();
        ChartOfAccount cashAccount = accounts.stream()
            .filter(a -> "ASSET".equals(a.getAccountType()))
            .findFirst().orElse(null);
        
        BankAccount ba1 = new BankAccount();
        ba1.setAccountName("HDFC Current Account");
        ba1.setBankName("HDFC Bank");
        ba1.setAccountNumber("50100123456789");
        ba1.setRoutingNumber("HDFC0001234");
        ba1.setBankBranch("Fort, Mumbai");
        ba1.setAccountType("Current");
        ba1.setCurrentBalance(new BigDecimal("5000000.00"));
        ba1.setCurrencyCode("INR");
        ba1.setIsActive(true);
        if (cashAccount != null) ba1.setGlAccount(cashAccount);
        bankAccountRepository.save(ba1);

        BankAccount ba2 = new BankAccount();
        ba2.setAccountName("ICICI Savings Account");
        ba2.setBankName("ICICI Bank");
        ba2.setAccountNumber("012301234567");
        ba2.setRoutingNumber("ICIC0000123");
        ba2.setBankBranch("Andheri, Mumbai");
        ba2.setAccountType("Savings");
        ba2.setCurrentBalance(new BigDecimal("2500000.00"));
        ba2.setCurrencyCode("INR");
        ba2.setIsActive(true);
        if (cashAccount != null) ba2.setGlAccount(cashAccount);
        bankAccountRepository.save(ba2);

        BankAccount ba3 = new BankAccount();
        ba3.setAccountName("SBI Current Account");
        ba3.setBankName("State Bank of India");
        ba3.setAccountNumber("39876543210");
        ba3.setRoutingNumber("SBIN0001234");
        ba3.setBankBranch("Connaught Place, Delhi");
        ba3.setAccountType("Current");
        ba3.setCurrentBalance(new BigDecimal("7500000.00"));
        ba3.setCurrencyCode("INR");
        ba3.setIsActive(true);
        if (cashAccount != null) ba3.setGlAccount(cashAccount);
        bankAccountRepository.save(ba3);
    }

    private void seedHolidays() {
        if (holidayRepository.count() > 0) return;
        
        Holiday h1 = new Holiday();
        h1.setName("Republic Day");
        h1.setHolidayDate(LocalDate.of(2024, 1, 26));
        h1.setYear(2024);
        h1.setDescription("National holiday - Republic Day of India");
        h1.setHolidayType("FEDERAL");
        holidayRepository.save(h1);

        Holiday h2 = new Holiday();
        h2.setName("Independence Day");
        h2.setHolidayDate(LocalDate.of(2024, 8, 15));
        h2.setYear(2024);
        h2.setDescription("National holiday - Independence Day of India");
        h2.setHolidayType("FEDERAL");
        holidayRepository.save(h2);

        Holiday h3 = new Holiday();
        h3.setName("Gandhi Jayanti");
        h3.setHolidayDate(LocalDate.of(2024, 10, 2));
        h3.setYear(2024);
        h3.setDescription("National holiday - Birthday of Mahatma Gandhi");
        h3.setHolidayType("FEDERAL");
        holidayRepository.save(h3);
    }

    private void seedSalaryBands() {
        if (salaryBandRepository.count() > 0) return;
        
        List<Grade> grades = gradeRepository.findAll();
        
        SalaryBand sb1 = new SalaryBand();
        sb1.setBandCode("SB-G1");
        sb1.setName("Entry Level Band");
        sb1.setMinSalary(new BigDecimal("300000"));
        sb1.setMaxSalary(new BigDecimal("600000"));
        sb1.setCurrency("INR");
        if (!grades.isEmpty()) sb1.setGrade(grades.get(0));
        sb1.setIsActive(true);
        salaryBandRepository.save(sb1);

        SalaryBand sb2 = new SalaryBand();
        sb2.setBandCode("SB-G2");
        sb2.setName("Mid Level Band");
        sb2.setMinSalary(new BigDecimal("600000"));
        sb2.setMaxSalary(new BigDecimal("1500000"));
        sb2.setCurrency("INR");
        if (grades.size() > 1) sb2.setGrade(grades.get(1));
        sb2.setIsActive(true);
        salaryBandRepository.save(sb2);

        SalaryBand sb3 = new SalaryBand();
        sb3.setBandCode("SB-G3");
        sb3.setName("Senior Level Band");
        sb3.setMinSalary(new BigDecimal("1500000"));
        sb3.setMaxSalary(new BigDecimal("3500000"));
        sb3.setCurrency("INR");
        if (grades.size() > 2) sb3.setGrade(grades.get(2));
        sb3.setIsActive(true);
        salaryBandRepository.save(sb3);
    }

    private void seedNotifications() {
        if (userNotificationRepository.count() > 0) return;

        userNotificationService.createNotification("admin", "Welcome to HAO System",
            "Your ERP system is set up and ready to use. Explore the modules from the sidebar.", 
            "SYSTEM", null, null);

        userNotificationService.createNotification("admin", "3 Employees Added",
            "Sample employees have been added: Rajesh Sharma, Priya Patel, and Amit Verma.", 
            "HR_UPDATE", "Employee", null);

        userNotificationService.createNotification("admin", "Inventory Ready",
            "Warehouse and inventory items have been configured. You can start managing stock.", 
            "STOCK_ALERT", "Inventory", null);

        userNotificationService.createNotification("admin", "Leave Types Configured",
            "Casual Leave, Sick Leave, and Earned Leave types are set up for the organization.", 
            "HR_UPDATE", "LeaveType", null);

        userNotificationService.createNotification("admin", "Projects Created",
            "3 projects are available: Digital Transformation, Cloud Migration, and ERP Implementation.", 
            "PR_APPROVAL", "Project", null);
    }
}
