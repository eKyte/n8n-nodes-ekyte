using Applications.Web.Models.Templates;
using Domain.ValueObject.Enums;
using System;
using System.Collections.Generic;
using System.Runtime.Serialization;

namespace Applications.Web.Models.Request
{
    [DataContract]
    public class TicketZapierRequest : ModelToDomainProfile
    {
        public TicketZapierRequest()
        {
        }

        [DataMember]
        public string Subject { get; set; }

        [DataMember]
        public string Message { get; set; }

        [DataMember]
        public TicketType TicketType { get; set; } = TicketType.Request;

        [DataMember]
        public DateTime? ExpectDueDate { get; set; }

        [DataMember]
        public long PriorityGroup { get; set; } = 0;

        [DataMember]
        public long? WorkspaceId { get; set; }

        [DataMember]
        public long? ProjectId { get; set; }

        [DataMember]
        public string UserEmail { get; set; }

        [DataMember]
        public string RequesterEmail { get; set; }

        [DataMember]
        public string UsersCC { get; set; }

        [DataMember]
        public string AnalystEmail { get; set; }

        [DataMember]
        public ICollection<TicketCCRequest> TicketCC { get; set; } = new List<TicketCCRequest>();
    }
}