using Applications.Web.Models.Templates;
using Domain.Entities.Workspaces.Plans;
using System.Runtime.Serialization;

namespace Applications.Web.Models.Request
{
    public class NoteZapierRequest : ModelToDomainProfile
    {
        public NoteZapierRequest() 
        {
        }

        [DataMember]
        public long PlanId { get; set; }

        [DataMember]
        public string Category { get; set; }

        [DataMember]
        public string Title { get; set; }

        [DataMember]
        public string Description { get; set; }

        [DataMember]
        public string Content { get; set; }
    }
}
