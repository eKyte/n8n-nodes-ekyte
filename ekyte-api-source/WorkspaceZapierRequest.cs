using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Runtime.Serialization;
using Applications.Web.Models.Templates;
using Domain.Entities.Companies;
using Domain.Entities.Workspaces;
using Domain.ValueObject.Enums;

namespace Applications.Web.Models.Request
{
    [DataContract]
    public class WorkspaceZapierRequest : ModelToDomainProfile
    {
        public WorkspaceZapierRequest()
        {
            CreateMap<WorkspaceZapierRequest, Workspace>();
        }

        [DataMember]
        public long Id { get; set; }

        [Required]
        [DataMember]
        public string Name { get; set; }

        [DataMember]
        public string Description { get; set; }

        [Required]
        [DataMember]
        public long CompanyId { get; set; }

        [DataMember]
        public NoOrYes Active { get; set; }

        [DataMember]
        public string DefaultLanguage { get; set; } = "pt-BR";

        [DataMember]
        public NoOrYes ShareAudiencesAndPersonas { get; set; } = NoOrYes.No;

        [DataMember]
        public NoOrYes ShareChannels { get; set; } = NoOrYes.No;

        [DataMember]
        public NoOrYes EnableGenAi { get; set; } = NoOrYes.No;

        [DataMember]
        public long? AvatarId { get; set; }

        [DataMember]
        public long? SquadId { get; set; }

        [DataMember]
        public string ExternalId { get; set; }


        [DataMember]
        public ICollection<CompanyWorkspacesRequest> Companies { get; set; }
    }
}