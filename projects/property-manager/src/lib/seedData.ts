function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

function daysFromNow(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

function monthsAgo(n: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() - n);
  return d.toISOString().slice(0, 10);
}

function monthsFromNow(n: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() + n);
  return d.toISOString().slice(0, 10);
}

function firstOfMonthAgo(n: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() - n);
  d.setDate(1);
  return d.toISOString().slice(0, 10);
}

function firstOfCurrentMonth(): string {
  const d = new Date();
  d.setDate(1);
  return d.toISOString().slice(0, 10);
}

export function seedData() {
  const properties = [
    {
      id: 'prop-001',
      address: '742 Evergreen Terrace, Springfield IL',
      unit: '',
      type: 'House',
      bedrooms: 3,
      bathrooms: 2,
      sqft: 1850,
      purchasePrice: 285000,
      monthlyMortgage: 1450,
      photoUrl: '',
      status: 'occupied',
      createdAt: monthsAgo(8),
    },
    {
      id: 'prop-002',
      address: '100 Industrial Ave, Chicago IL',
      unit: 'Suite 4',
      type: 'Commercial',
      bedrooms: 0,
      bathrooms: 1,
      sqft: 1200,
      purchasePrice: 420000,
      monthlyMortgage: 2100,
      photoUrl: '',
      status: 'occupied',
      createdAt: monthsAgo(6),
    },
    {
      id: 'prop-003',
      address: '88 Lakeview Drive, Evanston IL',
      unit: 'Apt 7',
      type: 'Apartment',
      bedrooms: 2,
      bathrooms: 1,
      sqft: 950,
      purchasePrice: 195000,
      monthlyMortgage: 980,
      photoUrl: '',
      status: 'vacant',
      createdAt: monthsAgo(14),
    },
  ];

  const tenants = [
    {
      id: 'ten-001',
      propertyId: 'prop-001',
      name: 'Alice Johnson',
      email: 'alice@email.com',
      phone: '(312) 555-0101',
      leaseStart: monthsAgo(6),
      leaseEnd: monthsFromNow(6),
      monthlyRent: 2200,
      depositHeld: 2200,
      depositReturned: false,
      notes: '',
      status: 'active',
    },
    {
      id: 'ten-002',
      propertyId: 'prop-002',
      name: "Bob's Auto LLC",
      email: 'bob@bosauto.com',
      phone: '(312) 555-0202',
      leaseStart: monthsAgo(2),
      leaseEnd: daysFromNow(25),
      monthlyRent: 3500,
      depositHeld: 7000,
      depositReturned: false,
      notes: '',
      status: 'active',
    },
    {
      id: 'ten-003',
      propertyId: 'prop-003',
      name: 'Carol Davis',
      email: 'carol@email.com',
      phone: '(847) 555-0303',
      leaseStart: monthsAgo(14),
      leaseEnd: monthsAgo(2),
      monthlyRent: 1600,
      depositHeld: 1600,
      depositReturned: true,
      notes: '',
      status: 'past',
    },
  ];

  const payments = [
    // 2 months ago - paid
    {
      id: crypto.randomUUID(),
      propertyId: 'prop-001',
      tenantId: 'ten-001',
      amount: 2200,
      type: 'rent',
      dueDate: firstOfMonthAgo(2),
      paidDate: firstOfMonthAgo(2),
      status: 'paid',
      notes: '',
    },
    {
      id: crypto.randomUUID(),
      propertyId: 'prop-002',
      tenantId: 'ten-002',
      amount: 3500,
      type: 'rent',
      dueDate: firstOfMonthAgo(2),
      paidDate: firstOfMonthAgo(2),
      status: 'paid',
      notes: '',
    },
    // Last month - paid
    {
      id: crypto.randomUUID(),
      propertyId: 'prop-001',
      tenantId: 'ten-001',
      amount: 2200,
      type: 'rent',
      dueDate: firstOfMonthAgo(1),
      paidDate: firstOfMonthAgo(1),
      status: 'paid',
      notes: '',
    },
    {
      id: crypto.randomUUID(),
      propertyId: 'prop-002',
      tenantId: 'ten-002',
      amount: 3500,
      type: 'rent',
      dueDate: firstOfMonthAgo(1),
      paidDate: firstOfMonthAgo(1),
      status: 'paid',
      notes: '',
    },
    // This month
    {
      id: crypto.randomUUID(),
      propertyId: 'prop-001',
      tenantId: 'ten-001',
      amount: 2200,
      type: 'rent',
      dueDate: firstOfCurrentMonth(),
      paidDate: null,
      status: 'pending',
      notes: '',
    },
    {
      id: crypto.randomUUID(),
      propertyId: 'prop-002',
      tenantId: 'ten-002',
      amount: 3500,
      type: 'rent',
      dueDate: daysAgo(8),
      paidDate: null,
      status: 'overdue',
      notes: '',
    },
  ];

  const maintenance = [
    {
      id: 'main-001',
      propertyId: 'prop-001',
      title: 'Leaking kitchen faucet',
      description: 'Kitchen faucet has a slow drip that needs repair.',
      category: 'plumbing',
      priority: 'medium',
      status: 'open',
      cost: 0,
      contractorName: '',
      contractorPhone: '',
      reportedDate: daysAgo(5),
      resolvedDate: null,
    },
    {
      id: 'main-002',
      propertyId: 'prop-002',
      title: 'HVAC not cooling',
      description: 'AC unit is blowing warm air. Needs immediate attention.',
      category: 'hvac',
      priority: 'emergency',
      status: 'in_progress',
      cost: 350,
      contractorName: 'Cool Air Inc',
      contractorPhone: '(312) 555-9999',
      reportedDate: daysAgo(2),
      resolvedDate: null,
    },
    {
      id: 'main-003',
      propertyId: 'prop-003',
      title: 'Repaint bedroom walls',
      description: 'Walls need fresh paint before next tenant.',
      category: 'other',
      priority: 'low',
      status: 'resolved',
      cost: 400,
      contractorName: 'Pro Painters',
      contractorPhone: '(847) 555-8888',
      reportedDate: daysAgo(30),
      resolvedDate: daysAgo(20),
    },
  ];

  const expenses = [
    {
      id: crypto.randomUUID(),
      propertyId: 'prop-001',
      category: 'mortgage',
      amount: 1450,
      date: firstOfMonthAgo(1),
      description: 'Monthly mortgage payment',
      recurring: true,
    },
    {
      id: crypto.randomUUID(),
      propertyId: 'prop-001',
      category: 'insurance',
      amount: 120,
      date: firstOfMonthAgo(1),
      description: 'Property insurance',
      recurring: true,
    },
    {
      id: crypto.randomUUID(),
      propertyId: 'prop-002',
      category: 'mortgage',
      amount: 2100,
      date: firstOfMonthAgo(1),
      description: 'Monthly mortgage payment',
      recurring: true,
    },
    {
      id: crypto.randomUUID(),
      propertyId: 'prop-002',
      category: 'tax',
      amount: 875,
      date: firstOfMonthAgo(1),
      description: 'Quarterly property tax',
      recurring: false,
    },
  ];

  localStorage.setItem('rp_properties', JSON.stringify(properties));
  localStorage.setItem('rp_tenants', JSON.stringify(tenants));
  localStorage.setItem('rp_payments', JSON.stringify(payments));
  localStorage.setItem('rp_maintenance', JSON.stringify(maintenance));
  localStorage.setItem('rp_expenses', JSON.stringify(expenses));
}
