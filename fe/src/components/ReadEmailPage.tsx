import { Address, Email, useAppManager } from "../contexts/Contexts";
import BackArrowIcon from "../assets/arrow_back.svg"
import AddIcon from "../assets/add.svg"
import ReplyIcon from "../assets/reply.svg"
import SendEmailPage from "./SendEmailPage";

export const ReadEmailPage = ({ email }: { email: Email }) => {
  const { popElem, pushElem } = useAppManager();
  return <div className="flex flex-col justify-start items-center box-border w-dvw h-[calc(100vh-6.25rem)] p-4 sm:ml-50 overflow-scroll rounded border-4 border-neutral-950">
    <div className="flex items-center justify-between w-full h-10 bg-[#101010] p-2 mb-2">
      <div className="cursor-pointer" onClick={async () => {
        popElem();
      }}>
        <img src={BackArrowIcon} alt="Back Arrow Icon" className="w-6 h-6 mt-1 " />
      </div>
      <div className="flex">
        <div className="cursor-pointer" onClick={async () => {
          pushElem(<SendEmailPage email={null} />);
        }}>
          <img src={AddIcon} alt="Add Icon" className="w-6 h-6 mt-1 " />
        </div>
        <div className="cursor-pointer" onClick={async () => {
          pushElem(<SendEmailPage email={email} />);
        }}>
          <img src={ReplyIcon} alt="Reply Icon" className="w-6 h-6 mt-1 " />
        </div>
      </div>
    </div>
    <EmailViewer email={email} />
  </div>;


};
export const EmailViewer = ({ email }: { email: Email }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const formatAddresses = (addresses: Address[]) => {
    return addresses.map(addr => addr.Name || addr.Address).join(', ');
  };

  return (
    <div className="w-full mx-auto p-6 bg-white rounded-lg shadow-md">
      {/* Header Section */}
      <div className="border-b pb-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">{email.Subject}</h1>

        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-sm text-gray-600">
              <span className="font-semibold">From:</span> {formatAddresses(email.From)}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-semibold">To:</span> {formatAddresses(email.To)}
            </p>
          </div>
          <p className="text-sm text-gray-500">{formatDate(email.Date)}</p>
        </div>
      </div>

      {/* Body Section */}
      <div className="mb-8">
        {email.HTMLBody ? (
          <div
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: email.HTMLBody }}
          />
        ) : (
          <pre className="whitespace-pre-wrap font-sans text-gray-800">{email.Body}</pre>
        )}
      </div>

      {/* Attachments Section */}
      {email.Attachments && email.Attachments.length > 0 && (
        <div className="border-t pt-4">
          <h3 className="font-semibold text-gray-700 mb-2">Attachments ({email.Attachments.length})</h3>
          <ul className="space-y-2">
            {email.Attachments.map((attachment, index) => (
              <li key={index} className="flex items-center">
                <svg className="w-5 h-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <span className="text-blue-600 hover:underline cursor-pointer">
                  {attachment.filename || `Attachment ${index + 1}`}
                </span>
                <span className="text-xs text-gray-500 ml-2">({Math.round(attachment.size / 1024)} KB)</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Metadata Section */}
      <div className="mt-8 pt-4 border-t text-xs text-gray-500">
        <p><span className="font-semibold">Message ID:</span> {email.MessageId}</p>
        {email.References && (
          <p><span className="font-semibold">References:</span> {email.References}</p>
        )}
        {email.ReplyTo && (
          <p><span className="font-semibold">Reply-To:</span> {email.ReplyTo}</p>
        )}
      </div>
    </div>
  );


};

