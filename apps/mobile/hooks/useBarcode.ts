import { useQuery } from '@tanstack/react-query';
import { lookupBarcode } from '../services/barcode';

export function useBarcodeLookup(barcode: string | null) {
  return useQuery({
    queryKey: ['barcode', barcode],
    queryFn: () => lookupBarcode(barcode!),
    enabled: !!barcode,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours — OFF data doesn't change often
    retry: 1,
  });
}
