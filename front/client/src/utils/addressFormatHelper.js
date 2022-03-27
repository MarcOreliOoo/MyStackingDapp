export default function addressFormatHelper(address) {
	return address.substr(0,5)+" ... "+address.substr(address.length - 4);
}