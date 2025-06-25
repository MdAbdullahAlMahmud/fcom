// Admin bKash/Nagad Transactions Page
'use client';
import { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { formatDate } from '@/lib/utils';

const COMPANY_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'bkash', label: 'bKash' },
  { value: 'nagad', label: 'Nagad' },
];
const STATUS_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'verified', label: 'Verified' },
  { value: 'not verified', label: 'Not Verified' },
];
const SORT_OPTIONS = [
  { value: 'latest', label: 'Latest' },
  { value: 'amount_asc', label: 'Amount Asc' },
  { value: 'amount_desc', label: 'Amount Desc' },
];

export default function BkashNagadTransactionsPage() {
  const [transactions, setTransactions] = useState<any[] | null>(null);
  const [unverifiedTransactions, setUnverifiedTransactions] = useState<any[] | null>(null);
  const [company, setCompany] = useState('all');
  const [status, setStatus] = useState('all');
  const [sort, setSort] = useState('latest');
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingUnverified, setLoadingUnverified] = useState(false);

  useEffect(() => {
    fetchTransactions();
    // eslint-disable-next-line
  }, [company, status, sort, page]);

  useEffect(() => {
    fetchUnverifiedTransactions();
  }, []);

  async function fetchTransactions() {
    setLoading(true);
    setTransactions(null); // Reset to null to distinguish initial/loading state
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      ...(company !== 'all' && { company }),
      ...(status !== 'all' && { status }),
      ...(sort && { sort }),
    });
    const res = await fetch(`/api/admin/bkash-nagad/transactions?${params}`);
    const data = await res.json();
    setTransactions(data.transactions || []);
    setTotalPages(data.pagination?.totalPages || 1);
    setLoading(false);
  }

  async function fetchUnverifiedTransactions() {
    setLoadingUnverified(true);
    const params = new URLSearchParams({ status: 'not verified', limit: '100' });
    const res = await fetch(`/api/admin/bkash-nagad/transactions?${params}`);
    const data = await res.json();
    setUnverifiedTransactions(data.transactions || []);
    setLoadingUnverified(false);
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">bKash/Nagad Transactions</h1>

  

      <div className="flex gap-4 mb-6">
        <Select value={company} onValueChange={setCompany}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Company" />
          </SelectTrigger>
          <SelectContent>
            {COMPANY_OPTIONS.map(opt => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map(opt => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map(opt => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="rounded-md border bg-white overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Sender</TableHead>
              <TableHead>TrxID</TableHead>
              <TableHead>Payment Time</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Verification Time</TableHead>
              <TableHead>Order Number</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading || transactions === null ? (
              <TableRow><TableCell colSpan={11}>Loading...</TableCell></TableRow>
            ) : transactions.length === 0 ? (
              <TableRow><TableCell colSpan={11}>No data found.</TableCell></TableRow>
            ) : transactions.map(trx => (
              <TableRow key={trx.id}>
                <TableCell>{trx.id}</TableCell>
                <TableCell>{trx.text_company}</TableCell>
                <TableCell>{trx.amount}</TableCell>
                <TableCell>{trx.sender}</TableCell>
                <TableCell>{trx.TrxID}</TableCell>
                <TableCell>{trx.payment_time}</TableCell>
                <TableCell>{trx.status}</TableCell>
                <TableCell>{trx.phone}</TableCell>
                <TableCell>{trx.name}</TableCell>
                <TableCell>{trx.verification_time}</TableCell>
                <TableCell>{trx.order_number || '-'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="mt-4 flex justify-center">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious onClick={() => setPage(p => Math.max(1, p - 1))} aria-disabled={page === 1} />
            </PaginationItem>
            {[...Array(totalPages)].map((_, idx) => (
              <PaginationItem key={idx}>
                <PaginationLink isActive={page === idx + 1} onClick={() => setPage(idx + 1)}>
                  {idx + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext onClick={() => setPage(p => Math.min(totalPages, p + 1))} aria-disabled={page === totalPages} />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}
