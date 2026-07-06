import React, { useState } from 'react';
import { Show, Theatre, Screen, Coupon } from '../types';
import { useApp } from '../context/AppContext';
import { Armchair, CreditCard, Ticket, CheckCircle2, TicketPercent, AlertCircle } from 'lucide-react';

interface SeatSelectorProps {
  show: Show;
  theatre: Theatre;
  screen: Screen;
  onConfirmBooking: (seats: string[], totalAmount: number, discountAmount: number, couponCode?: string) => Promise<void>;
  onCancel: () => void;
}

export const SeatSelector: React.FC<SeatSelectorProps> = ({
  show,
  theatre,
  screen,
  onConfirmBooking,
  onCancel,
}) => {
  const { apiFetch } = useApp();
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const rows = Array.from({ length: screen.rows }, (_, i) => String.fromCharCode(65 + i)); // A, B, C...
  const cols = Array.from({ length: screen.cols }, (_, i) => i + 1); // 1, 2, 3...

  // Classify row tiers
  const getSeatTier = (rowChar: string): 'vip' | 'platinum' | 'gold' | 'silver' => {
    const charCode = rowChar.charCodeAt(0) - 65;
    if (charCode < 2 && screen.tierPrices.vip) return 'vip';
    if (charCode < 4 && screen.tierPrices.platinum) return 'platinum';
    if (charCode < 6 && screen.tierPrices.gold) return 'gold';
    return 'silver';
  };

  const getSeatPrice = (seatId: string): number => {
    const rowChar = seatId.substring(0, 1);
    const tier = getSeatTier(rowChar);
    return screen.tierPrices[tier] || show.ticketPrice;
  };

  const handleSeatClick = (seatId: string) => {
    if (show.bookedSeats.includes(seatId)) return; // Booked

    setSelectedSeats((prev) =>
      prev.includes(seatId) ? prev.filter((s) => s !== seatId) : [...prev, seatId]
    );
  };

  // Pricing
  const baseTotal = selectedSeats.reduce((sum, seat) => sum + getSeatPrice(seat), 0);
  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountType === 'percentage') {
      discountAmount = Math.round((baseTotal * appliedCoupon.value) / 100);
    } else {
      discountAmount = Math.min(appliedCoupon.value, baseTotal);
    }
  }
  const finalTotal = Math.max(baseTotal - discountAmount, 0);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponError('');
    try {
      const coupon: Coupon = await apiFetch(`/api/coupons/validate/${couponCode.trim()}`);
      if (baseTotal < coupon.minPurchase) {
        setCouponError(`Min purchase of $${coupon.minPurchase} required for this coupon.`);
        setAppliedCoupon(null);
      } else {
        setAppliedCoupon(coupon);
        setCouponError('');
      }
    } catch (e: any) {
      setCouponError('Invalid or inactive coupon code.');
      setAppliedCoupon(null);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
  };

  const handleBook = async () => {
    if (selectedSeats.length === 0) return;
    setIsSubmitting(true);
    setErrorMsg('');
    try {
      await onConfirmBooking(selectedSeats, finalTotal, discountAmount, appliedCoupon?.code);
    } catch (e: any) {
      setErrorMsg(e.message || 'An error occurred during booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="seat-layout-designer" className="grid grid-cols-1 lg:grid-cols-3 gap-8 py-4">
      {/* Visual Arena */}
      <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-8 space-y-8 flex flex-col items-center backdrop-blur-md">
        {/* Screen Indicator */}
        <div className="w-full max-w-md text-center space-y-2">
          <div className="text-[10px] text-zinc-500 font-extrabold uppercase tracking-widest">
            {screen.name} Stage Front
          </div>
          <div className="h-2 w-full bg-gradient-to-r from-white/5 via-rose-500/40 to-white/5 rounded-b-2xl blur-[1px]" />
          <div className="text-xs text-zinc-500 font-bold">SCREEN THIS WAY</div>
        </div>

        {/* Seat Layout Grid */}
        <div className="w-full overflow-x-auto pb-4 flex justify-center">
          <div className="grid gap-2.5 min-w-[320px]">
            {rows.map((row) => (
              <div key={row} className="flex items-center gap-2.5">
                {/* Row label left */}
                <span className="w-5 text-center text-xs font-bold text-zinc-650">{row}</span>

                {/* Seats */}
                <div className="flex gap-2">
                  {cols.map((col) => {
                    const seatId = `${row}${col}`;
                    const isBooked = show.bookedSeats.includes(seatId);
                    const isSelected = selectedSeats.includes(seatId);
                    const tier = getSeatTier(row);

                    // Map colors/gradients based on tier and state
                    let btnColor = 'bg-zinc-800 hover:bg-zinc-700 border border-zinc-700/50 text-zinc-300';
                    if (isBooked) {
                      btnColor = 'bg-zinc-950 border border-zinc-900 text-zinc-700 cursor-not-allowed';
                    } else if (isSelected) {
                      btnColor = 'bg-gradient-to-tr from-amber-400 to-rose-500 border border-amber-400 text-zinc-950 font-bold';
                    } else if (tier === 'vip') {
                      btnColor = 'bg-purple-950/40 border border-purple-500/40 text-purple-300 hover:bg-purple-900/65';
                    } else if (tier === 'platinum') {
                      btnColor = 'bg-indigo-950/40 border border-indigo-500/40 text-indigo-300 hover:bg-indigo-900/65';
                    } else if (tier === 'gold') {
                      btnColor = 'bg-amber-950/40 border border-amber-500/40 text-amber-300 hover:bg-amber-900/65';
                    }

                    return (
                      <button
                        key={seatId}
                        disabled={isBooked}
                        onClick={() => handleSeatClick(seatId)}
                        className={`w-8 h-8 rounded-lg text-[10px] font-semibold transition-all flex items-center justify-center cursor-pointer ${btnColor}`}
                        title={`${seatId} (${tier.toUpperCase()} - $${getSeatPrice(seatId)})`}
                      >
                        {col}
                      </button>
                    );
                  })}
                </div>

                {/* Row label right */}
                <span className="w-5 text-center text-xs font-bold text-zinc-650">{row}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 border-t border-white/10 pt-6 text-[10px] text-zinc-400 font-bold">
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded bg-zinc-800 border border-zinc-700/50" />
            <span>Available</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded bg-zinc-950 border border-zinc-900" />
            <span>Booked</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded bg-gradient-to-tr from-amber-400 to-rose-500 border border-amber-400" />
            <span>Selected</span>
          </div>
          {screen.tierPrices.vip && (
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded bg-purple-950/40 border border-purple-500/40" />
              <span>VIP (${screen.tierPrices.vip})</span>
            </div>
          )}
          {screen.tierPrices.platinum && (
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded bg-indigo-950/40 border border-indigo-500/40" />
              <span>Platinum (${screen.tierPrices.platinum})</span>
            </div>
          )}
          {screen.tierPrices.gold && (
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded bg-amber-950/40 border border-amber-500/40" />
              <span>Gold (${screen.tierPrices.gold})</span>
            </div>
          )}
          {screen.tierPrices.silver && (
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded bg-zinc-800 border border-zinc-700/50" />
              <span>Silver (${screen.tierPrices.silver})</span>
            </div>
          )}
        </div>
      </div>

      {/* Checkout Sidebar Card */}
      <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-6 flex flex-col justify-between shadow-xl backdrop-blur-md">
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <h3 className="text-sm font-black text-white uppercase tracking-wider">Booking Breakdown</h3>
            <span className="text-[10px] bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold px-2 py-0.5 rounded-full uppercase">
              {theatre.city}
            </span>
          </div>

          {/* Show details summary */}
          <div className="space-y-1">
            <h4 className="text-sm font-extrabold text-zinc-100">{theatre.name}</h4>
            <p className="text-xs text-zinc-400 font-medium">
              {screen.name} • {show.date} @ {show.time}
            </p>
          </div>

          {/* Selected Seats summary */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span>Seats Selected ({selectedSeats.length})</span>
              <span className="font-mono text-zinc-200">
                {selectedSeats.length > 0 ? selectedSeats.sort().join(', ') : 'None'}
              </span>
            </div>
            {selectedSeats.length > 0 && (
              <div className="bg-black/30 rounded-xl p-3 border border-white/10 space-y-1">
                {selectedSeats.map((seat) => (
                  <div key={seat} className="flex justify-between items-center text-[10px] text-zinc-400 font-medium">
                    <span>Seat {seat} ({getSeatTier(seat.substring(0, 1)).toUpperCase()})</span>
                    <span className="font-mono text-zinc-200">${getSeatPrice(seat)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Coupon Input */}
          {selectedSeats.length > 0 && (
            <div className="space-y-2 border-t border-white/10 pt-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-zinc-400 flex items-center gap-1">
                  <TicketPercent size={13} className="text-amber-400" /> Apply Coupon
                </label>
                {appliedCoupon && (
                  <button
                    onClick={handleRemoveCoupon}
                    className="text-[10px] text-rose-400 hover:underline font-bold"
                  >
                    Remove
                  </button>
                )}
              </div>

              {!appliedCoupon ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. WELCOME10"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    className="flex-1 bg-white/5 border border-white/10 focus:border-rose-500/50 text-white rounded-xl px-3 py-1.5 text-xs focus:outline-none transition-colors"
                  />
                  <button
                    onClick={handleApplyCoupon}
                    className="bg-white/10 hover:bg-white/15 border border-white/10 hover:text-white text-zinc-300 font-bold px-3.5 py-1.5 rounded-xl text-xs transition-all"
                  >
                    Apply
                  </button>
                </div>
              ) : (
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-2.5 flex items-center justify-between text-emerald-400 text-xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={14} />
                    <span className="font-bold">Code applied: {appliedCoupon.code}</span>
                  </div>
                  <span className="font-mono font-bold">
                    {appliedCoupon.discountType === 'percentage' ? `-${appliedCoupon.value}%` : `-$${appliedCoupon.value}`}
                  </span>
                </div>
              )}

              {couponError && (
                <p className="text-[10px] text-rose-400 flex items-center gap-1 font-semibold">
                  <AlertCircle size={10} /> {couponError}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer/Total and Book Button */}
        <div className="space-y-4 border-t border-white/10 pt-4">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-zinc-400 font-medium">
              <span>Ticket Subtotal</span>
              <span className="font-mono text-zinc-200">${baseTotal}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex items-center justify-between text-xs text-emerald-400 font-semibold">
                <span>Discount Deduction</span>
                <span className="font-mono">-${discountAmount}</span>
              </div>
            )}
            <div className="flex items-center justify-between text-sm font-black text-white">
              <span>Final Payable</span>
              <span className="font-mono text-amber-400 text-lg">${finalTotal}</span>
            </div>
          </div>

          {errorMsg && (
            <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-xl font-medium">
              {errorMsg}
            </p>
          )}

          <div className="flex gap-2">
            <button
              onClick={onCancel}
              className="flex-1 bg-white/10 border border-white/10 hover:bg-white/15 text-zinc-300 hover:text-white font-extrabold py-2.5 rounded-xl text-xs transition-all"
            >
              Back
            </button>
            <button
              disabled={selectedSeats.length === 0 || isSubmitting}
              onClick={handleBook}
              className={`flex-[2] bg-gradient-to-r from-amber-400 via-rose-500 to-rose-600 hover:from-amber-300 hover:via-rose-400 hover:to-rose-500 text-zinc-950 font-black py-2.5 rounded-xl text-xs transition-all shadow-md shadow-rose-500/10 flex items-center justify-center gap-2 transform active:scale-95 cursor-pointer ${
                selectedSeats.length === 0 ? 'opacity-40 cursor-not-allowed transform-none' : ''
              }`}
            >
              <CreditCard size={14} />
              {isSubmitting ? 'Processing...' : `Pay & Book`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
