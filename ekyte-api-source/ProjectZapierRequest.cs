using Applications.Web.Models.Templates;
using System;
using System.Runtime.Serialization;

namespace Applications.Web.Models.Request
{
    public class ProjectZapierRequest : ModelToDomainProfile
    {
        [DataMember]
        public string Name { get; set; }

        [DataMember]
        public string Alias { get; set; }

        [DataMember]
        public string Description { get; set; }

        [DataMember]
        public long? WorkspaceId { get; set; }

        [DataMember]
        public string Tags { get; set; }

        [DataMember]
        public DateTime? StartDate { get; set; }
    }
}
